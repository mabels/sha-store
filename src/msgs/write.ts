import * as uuid from 'uuid';
import { Msg } from './msg';
import { Match } from './match';
import { PouchConnect } from './pouch-connect';

export class Write extends Msg {
  public readonly mimeBlock: string;
  public readonly pouchConnect: PouchConnect;

  public static is(msg: any): Match<Write> {
    if (msg instanceof Write) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<Write>(msg);
    }
    return Match.nothing();
  }

  public static string(pouchConnect: PouchConnect, str: string, tid = uuid.v4()): Write {
    return Write.buffer(pouchConnect, Buffer.from(str, 'utf8'), tid);
  }

  public static buffer(pouchConnect: PouchConnect, buff: Buffer, tid = uuid.v4()): Write {
    return Write.base64(pouchConnect, buff.toString('base64'), tid);
  }

  public static base64(pouchConnect: PouchConnect, buff: string, tid = uuid.v4()): Write {
    return new Write(pouchConnect, buff, tid);
  }

  constructor(pouchConnect: PouchConnect, block: string, tid = uuid.v4()) {
    super(tid);
    this.pouchConnect = pouchConnect;
    this.mimeBlock = block;
  }

  public asBuffer(): Buffer {
    return Buffer.from(this.mimeBlock, 'base64');
  }

}
