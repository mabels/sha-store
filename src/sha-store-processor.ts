import * as url from 'url';

import * as uuid from 'uuid';
import * as PouchDB from 'pouchdb';

import { WriteReq } from './msgs/write-req';
import { ReadReq } from './msgs/read-req';
import { ReadRes } from './msgs/read-res';
import { WriteRes } from './msgs/write-res';

import {
  PouchConfig,
  MsgBus,
  PouchBase,
  PouchConnectionRes,
  PouchConnectionReq
} from 'foundation-store';
import { FragmentType } from './types/fragment-type';
import { StringBlock } from './types/string-block';
import { Block } from './types/block';
import { Base64Block } from './types/base64-block';

interface ShaPouchInit {
  readonly sha: string;
  readonly block: string; // mimestring
}

class ShaPouchDocV1 extends PouchBase implements ShaPouchInit {
  public readonly sha: string;
  public readonly block: string; // mimestring

  public static create(spi: ShaPouchInit): ShaPouchDocV1 {
    return new ShaPouchDocV1(spi);
  }

  private constructor(spi: ShaPouchInit) {
    super();
    this.sha = spi.sha;
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

  private pouchDbFrom(pc: PouchConfig): Promise<PouchDB.Database> {
    return new Promise<PouchDB.Database>((rs, rj) => {
      const tid = uuid.v4();
      const sub = this.msgBus.subscribe(msg => {
        PouchConnectionRes.is(msg).hasTid(tid).match(pcr => {
          sub.unsubscribe();
          rs(pcr.pouchDb);
        });
      });
      this.msgBus.next(new PouchConnectionReq(tid, pc));
    });
  }

  private writeBySha(pc: PouchConfig, block: Block, created: string,
    cb: (err: any, result: PouchDB.Core.Response) => void): void {
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

  private readBySha(pc: PouchConfig, sha: string,
    cb: (err: any, result: PouchDB.Find.FindResponse<ShaPouchDocV1>) => void): void {
    this.pouchDbFrom(pc).then(pouchDb => {
      pouchDb.find({
        selector: { sha: sha, type: ShaPouchDocV1.name },
        fields: ['_id', 'type', 'sha', 'created', 'block'],
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
    this.readBySha(fwq.config, fwq.block.asSha(), (err, result) => {
      if (err) {
        msgBus.next(new WriteRes({
          error: err,
          _id: 'Error',
          created: 'Error',
          tid: fwq.tid,
          sha: fwq.block.asSha(),
          seq: fwq.seq,
          fragmentType: fwq.fragmentType
        }));
        return;
      }
      if (fwq.block.length === 0) {
        msgBus.next(new WriteRes({
          _id: 'EMPTY',
          created: 'never',
          tid: fwq.tid,
          sha: fwq.block.asSha(),
          seq: fwq.seq,
          fragmentType: fwq.fragmentType
        }));
        return;
      }
      const created = (new Date()).toISOString();
      this.writeBySha(fwq.config, fwq.block, created, (err_, result_) => {
        if (err_) {
          msgBus.next(new WriteRes({
            error: err_,
            _id: 'Error',
            created: 'Error',
            tid: fwq.tid,
            sha: fwq.block.asSha(),
            seq: fwq.seq,
            fragmentType: fwq.fragmentType
          }));
          return;
        }
        msgBus.next(new WriteRes({
          error: err_,
          _id: result_.id,
          created: created,
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
          tid: rmsg.tid,
          seq: rmsg.seq,
          block: new StringBlock(''),
          fragmentType: FragmentType.NOTFOUND
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
            ids: result.docs.map(i => new PouchBase({
              _id: i._id,
              type: i.type,
              created: i.created
            })),
            sha: rmsg.sha,
            tid: rmsg.tid,
            seq: rmsg.seq,
            block: new Base64Block(doc.block),
            fragmentType: rmsg.fragmentType
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
