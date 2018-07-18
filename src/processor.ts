import * as url from 'url';

import * as uuid from 'uuid';
import * as PouchDB from 'pouchdb';

import { MsgBus } from './msg-bus';
import { WriteReq } from './msgs/write-req';
import { ReadReq } from './msgs/read-req';
import { ReadRes } from './msgs/read-res';
import { WriteRes } from './msgs/write-res';

import { PouchConnect } from './types/pouch-connect';
import { FragmentType } from './types/fragment-type';
import { StringBlock } from './types/string-block';
import { Block } from './types/block';
import { Base64Block } from './types/base64-block';

PouchDB.plugin(require('pouchdb-find'));

interface ShaPouchInit {
  readonly sha: string;
  readonly block: string; // mimestring
}

class ShaPouchDocV1 {
  public readonly _id: string;
  public readonly type: string;
  public readonly created: string;

  public readonly sha: string;
  public readonly block: string; // mimestring

  public static create(spi: ShaPouchInit): ShaPouchDocV1 {
    return new ShaPouchDocV1(spi);
  }

  private constructor(spi: ShaPouchInit) {
    this.type = this.constructor.name;
    // console.log(`ShaPouchDocV1:ShaPouchDocV1`, this.type);
    this._id = url.resolve(this.type, uuid.v4());
    this.created = (new Date()).toISOString();
    this.sha = spi.sha;
    this.block = spi.block;
  }

  public asObj(): ShaPouchDocV1 {
    return this;
  }
}

class Connection {
  public readonly pouchConnect: PouchConnect;
  public readonly opened: Date = new Date();
  public readonly pouchDb: PouchDB.Database;

  constructor(pc: PouchConnect, db: PouchDB.Database) {
    this.pouchConnect = pc;
    this.pouchDb = db;
  }
}

export class Processor {

  private readonly pouchDbs: Map<string, Connection>;
  // private readonly writeActions: Map<string, FragmentWriteReq[]>;

  public static create(msgBus: MsgBus): Processor {
    return new Processor(msgBus);
  }

  private pouchDbFrom(pc: PouchConnect): Promise<PouchDB.Database> {
    return new Promise<PouchDB.Database>((rs, rj) => {
      let c = this.pouchDbs.get(pc.path);
      if (!c) {
        const pouchDb = new PouchDB(pc.path, pc.dbConfig);
        pouchDb.createIndex({ index: { fields: ['type', 'sha'] } }).then(__ => {
          c = new Connection(pc, pouchDb);
          this.pouchDbs.set(pc.path, c);
          rs(c.pouchDb);
        }).catch(rj);
      } else {
        rs(c.pouchDb);
      }
    });
  }

  private writeBySha(pc: PouchConnect, block: Block, created: string,
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

  private readBySha(pc: PouchConnect, sha: string,
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
    this.readBySha(fwq.pouchConnect, fwq.block.asSha(), (err, result) => {
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
      this.writeBySha(fwq.pouchConnect, fwq.block, created, (err_, result_) => {
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
    this.readBySha(rmsg.pouchConnect, rmsg.sha, (err, result) => {
      if (err) {
        msgBus.next(new ReadRes({
          pouchConnect: rmsg.pouchConnect,
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
          pouchConnect: rmsg.pouchConnect,
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
            pouchConnect: rmsg.pouchConnect,
            ids: result.docs.map(i => ({ _id: i._id, created: i.created })),
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
    this.pouchDbs = new Map<string, Connection>();

    msgBus.subscribe(msg => {
      ReadReq.is(msg).match(rmsg => this.readAction(msgBus, rmsg));
      WriteReq.is(msg).match(wmsg => this.writeAction(msgBus, wmsg));
    });
  }

}
