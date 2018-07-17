import * as uuid from 'uuid';

import { Msg } from './msg';
import { Match } from '../types/match';
import { PouchConnect } from '../types/pouch-connect';
import { Block } from '../types/block';
import { StringBlock } from '../types/string-block';
import { Base64Block } from '../types/base64-block';
import { BufferBlock } from '../types/buffer-block';

export class WriteReq extends Msg {
  public readonly block: Block;
  public readonly pouchConnect: PouchConnect;

  public static is(msg: any): Match<WriteReq> {
    if (msg instanceof WriteReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<WriteReq>(msg);
    }
    return Match.nothing();
  }

  public static string(pouchConnect: PouchConnect, str: string, tid = uuid.v4()): WriteReq {
    return new WriteReq(pouchConnect, new StringBlock(str), tid);
  }

  public static buffer(pouchConnect: PouchConnect, buff: Buffer, tid = uuid.v4()): WriteReq {
    return new WriteReq(pouchConnect, new BufferBlock(buff), tid);
  }

  public static base64(pouchConnect: PouchConnect, buff: string, tid = uuid.v4()): WriteReq {
    return new WriteReq(pouchConnect, new Base64Block(buff), tid);
  }

  constructor(pouchConnect: PouchConnect, block: Block, tid = uuid.v4()) {
    super(tid);
    this.pouchConnect = pouchConnect;
    this.block = block;
  }

}
