import { MsgBus } from './msg-bus';
import { FragmentWrite } from './msgs/fragment-write';
import * as crypto from 'crypto';
import * as PouchDB from 'pouchdb';
import { PouchConnect } from './msgs/pouch-connect';

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

  private readonly pouchDbs: Map<string, Connection> = new Map<string, Connection>();

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
    return c.pouchDb;
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      FragmentWrite.is(msg).match(wmsg => {
        const pouchDb = this.pouchDbFrom(wmsg.pouchConnect);
        const sha = crypto.createHash('sha256').update(wmsg.asBuffer()).digest('hex');
        pouchDb.find({
          selector: {sha: sha},
          fields: ['_id', 'sha'],
        }).then((result) => {
          console.log(result);
        }).catch((err) => {
          console.log(err);
        });
      });
    });
  }

}
