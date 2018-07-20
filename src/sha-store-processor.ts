import * as url from 'url';

import * as uuid from 'uuid';
import * as PouchDB from 'pouchdb';

import { WriteReq } from './msgs/write-req';
import { ReadReq } from './msgs/read-req';
import { ReadRes } from './msgs/read-res';
import { WriteRes } from './msgs/write-res';

import {
  Types,
  Msgs,
  MsgBus
} from '@storemate/foundation-store';
import { FragmentType } from './types/fragment-type';
import { StringBlock } from './types/string-block';
import { BlockObj } from './types/block';
import { Base64Block } from './types/base64-block';
import { DbRef } from '../node_modules/@storemate/foundation-store/dist/src/types';

// export interface ShaStoreRefInit extends Types.MatchType {
//   readonly sha: string;
// }

// export class ShaStoreRef extends PouchBase implements ShaStoreRefInit {
//   public readonly sha: string;
//   constructor(ssri: ShaStoreRefInit) {
//     super(ssri);
//     this.sha = ssri.sha;
//   }

//   public asObj(): ShaStoreRef {
//     return this;
//   }
// }

export interface ShaPouchDocV1Init {
  readonly sha: string;
  readonly block: string; // mimestring
}

export class ShaPouchDocV1 extends ShaStoreRef implements ShaPouchDocV1Init {
  public readonly block: string; // mimestring

  public static create(spi: ShaPouchDocV1Init): ShaPouchDocV1 {
    return new ShaPouchDocV1(spi);
  }

  private constructor(spi: ShaPouchDocV1Init) {
    super(spi);
    this.block = spi.block;
  }

  public asObj(): ShaPouchDocV1 {
    return this;
  }
}

export class ShaStoreProcessor {

  private readonly msgBus: MsgBus;

  public static create(msgBus: MsgBus): ShaStoreProcessor {
    return new ShaStoreProcessor(msgBus);
  }

  private pouchDbFrom(pc: Types.PouchConfigInit): Promise<PouchDB.Database> {
    return new Promise<PouchDB.Database>((rs, rj) => {
      const tid = uuid.v4();
      const sub = this.msgBus.subscribe(msg => {
        Msgs.PouchConnectionRes.is(msg).hasTid(tid).match(pcr => {
          sub.unsubscribe();
          rs(pcr.pouchDb);
        });
      });
      this.msgBus.next(new Msgs.PouchConnectionReq({
        msg: { tid: tid},
        config: pc
      }));
    });
  }

  private writeBySha(pc: Types.PouchConfigInit, block: BlockObj, created: string,
    cb: (err: any, result?: PouchDB.Core.Response) => void): void {
    this.pouchDbFrom(pc).then(pouchDb => {
      pouchDb.put(ShaPouchDocV1.create({
        sha: block.asSha(),
        block: block.asBase64()
      }).asObj()).then((result) => {
        cb(undefined, result);
      }).catch(err => {
        cb(err, undefined);
      });
    }).catch(err => {
      cb(err, undefined);
    });
  }

  private readBySha(pc: Types.PouchConfigInit, sha: string,
    cb: (err: any, result?: PouchDB.Find.FindResponse<ShaPouchDocV1>) => void): void {
    this.pouchDbFrom(pc).then(pouchDb => {
      pouchDb.find({
        selector: { sha: sha, type: ShaPouchDocV1.name },
        // fields: ['_id', 'type', 'sha', 'created', 'block'],
      }).then((result: PouchDB.Find.FindResponse<ShaPouchDocV1>) => {
        // console.log(sha, ShaPouchDocV1.name, result);
        cb(undefined, result);
      }).catch(err => {
        cb(err, undefined);
      });
    }).catch(err => {
      cb(err, undefined);
    });
  }

  private writeAction(msgBus: MsgBus, fwq: WriteReq): void {
    this.readBySha(fwq.config, fwq.block.sha, (err, result) => {
      if (err || !result) {
        msgBus.next(new WriteRes({
          dbRefs: [{
            _id: 'Error',
            error: err,
            created: 'Error'
          }],
          msg: {
            tid: fwq.msg.tid
          },
          sha: fwq.block.sha,
          seqFragment: fwq.seqFragment
        }));
        return;
      }
      if (result.docs.length === 0) {
        msgBus.next(new WriteRes({
          dbRefs: [{
          _id: 'EMPTY',
          created: 'never',
          }],
          msg: {
            tid: fwq.msg.tid
          },
          sha: fwq.block.sha,
          seqFragment: fwq.seqFragment
        }));
        return;
      }
      const created = (new Date()).toISOString();
      this.writeBySha(fwq.config, fwq.block, created, (err_, result_) => {
        if (err_) {
          msgBus.next(new WriteRes({
            dbRefs: [ {
              error: err_,
              _id: 'Error',
              created: 'Error',
            }],
            msg: fwq.msg,
            sha: fwq.block.sha,
            seqFragment: fwq.seqFragment
          }));
          return;
        }
        msgBus.next(new WriteRes({
          dbRefs: result.docs.map(i => new DbRef({
            _id: i._id,
            created: i.c
          }))
            error: err_,
            _id: result_.id,
            created: created,
          }]
          tid: fwq.tid,
          sha: fwq.block.asSha(),
          seq: fwq.seq,
          fragmentType: fwq.fragmentType
        }));
      });
    });
  }

  private readAction(msgBus: MsgBus, rmsg: ReadReq): void {
    this.readBySha(rmsg.config, rmsg.sha, (err, result) => {
      if (err) {
        msgBus.next(new ReadRes({
          ids: [],
          tid: rmsg.tid,
          sha: rmsg.sha,
          seq: rmsg.seq,
          block: new StringBlock(''),
          fragmentType: FragmentType.ERROR,
          error: err
        }));
        return;
      }
      if (result.docs.length == 0) {
        msgBus.next(new ReadRes({
          ids: [],
          sha: rmsg.sha,
          msg: { tid: rmsg.tid },
          block: new StringBlock(''),
          seqFragmentType: {
            seq: -1,
            fragmentType: FragmentType.NOTFOUND
          }
        }));
      } else {
        // console.log(result);
        if (result.docs.length > 1) {
          // reclaime double blocks;
          console.warn(`reclaim is not implemented: ${rmsg.sha} ${result.docs.map(i => i._id)}`);
        }
        result.docs.slice(0, 1).forEach(doc => {
          // console.log(`Doc:`, doc);
          msgBus.next(new ReadRes({
            dbRefs: result.docs.map(i => new DbRef({
              _id: i._id,
              type: i.type,
              created: i.created
            })),
            msg: rmsg.msg,
            sha: rmsg.sha,
            seqFragmentType: rmsg.seqFragmentType,
            block: (new Base64Block(doc.block)).asObj()
          }));
        });
      }
    });
  }

  private constructor(msgBus: MsgBus) {
    this.msgBus = msgBus;
    msgBus.subscribe(msg => {
      ReadReq.is(msg).match(rmsg => this.readAction(msgBus, rmsg));
      WriteReq.is(msg).match(wmsg => this.writeAction(msgBus, wmsg));
    });
  }

}
