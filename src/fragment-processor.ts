import * as uuid from 'uuid';
import * as PouchDB from 'pouchdb';

import { MsgBus } from './msg-bus';
import { FragmentWriteReq } from './msgs/fragment-write-req';
import { PouchConnect } from './types/pouch-connect';
import { FragmentReadReq } from './msgs/fragment-read-req';
import { FragmentReadRes } from './msgs/fragment-read-res';
import { FragmentType } from './types/fragment-type';
import { StringBlock } from './types/string-block';
import { FragmentWriteRes } from './msgs/fragment-write-res';
import { Block } from './types/block';
import { Base64Block } from './types/base64-block';

PouchDB.plugin(require('pouchdb-find'));

interface ShaPouchDoc {
  _id: string;
  sha: string;
  created: string;
  block: string; // mimestring
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

export class FragmentProcessor {

  private readonly pouchDbs: Map<string, Connection>;
  // private readonly writeActions: Map<string, FragmentWriteReq[]>;

  public static create(msgBus: MsgBus): FragmentProcessor {
    return new FragmentProcessor(msgBus);
  }

  private pouchDbFrom(pc: PouchConnect): PouchDB.Database {
    let c = this.pouchDbs.get(pc.path);
    if (!c) {
      const pouchDb = new PouchDB(pc.path, pc.dbConfig);
      c = new Connection(pc, pouchDb);
      this.pouchDbs.set(pc.path, c);
    }
    // console.log(`pouchDbFrom`, pc, c);
    return c.pouchDb;
  }

  private writeBySha(pc: PouchConnect, block: Block, created: string,
    cb: (err: any, result: PouchDB.Core.Response) => void): void {
    const pouchDb = this.pouchDbFrom(pc);
    pouchDb.put({
      _id: uuid.v4(),
      sha: block.asSha(),
      created: created,
      block: block.asBase64()
    }).then((result) => {
      cb(undefined, result);
    }).catch(err => {
      cb(err, undefined);
    });
  }

  private readBySha(pc: PouchConnect, sha: string,
    cb: (err: any, result: PouchDB.Find.FindResponse<ShaPouchDoc>) => void): void {
    const pouchDb = this.pouchDbFrom(pc);
    pouchDb.find({
      selector: { sha: sha },
      fields: ['_id', 'sha', 'created', 'block'],
    }).then((result: PouchDB.Find.FindResponse<ShaPouchDoc>) => {
      cb(undefined, result);
    }).catch(err => {
      cb(err, undefined);
    });
  }

  private writeAction(msgBus: MsgBus, fwq: FragmentWriteReq): void {
    this.readBySha(fwq.pouchConnect, fwq.block.asSha(), (err, result) => {
      if (err) {
        msgBus.next(new FragmentWriteRes({
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
        msgBus.next(new FragmentWriteRes({
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
          msgBus.next(new FragmentWriteRes({
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
        msgBus.next(new FragmentWriteRes({
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

  private readAction(msgBus: MsgBus, rmsg: FragmentReadReq): void {
    this.readBySha(rmsg.pouchConnect, rmsg.sha, (err, result) => {
      if (err) {
        msgBus.next(new FragmentReadRes({
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
        msgBus.next(new FragmentReadRes({
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
          msgBus.next(new FragmentReadRes({
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
      FragmentReadReq.is(msg).match(rmsg => this.readAction(msgBus, rmsg));
      FragmentWriteReq.is(msg).match(wmsg => this.writeAction(msgBus, wmsg));
    });
  }

}
