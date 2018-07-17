import * as uuid from 'uuid';
import { Msg } from './msg';
import { FragmentWriteRes } from './fragment-write-res';
import { Match } from '../types/match';

export class WriteRes extends Msg {
  public readonly blocks: FragmentWriteRes[] = [];

  public static is(msg: any): Match<WriteRes> {
    if (msg instanceof WriteRes) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<WriteRes>(msg);
    }
    return Match.nothing();
  }

  constructor(tid = uuid.v4()) {
    super(tid);
  }

  public isOk(): boolean {
    return this.blocks.filter(i => !i.isOk()).length == 0;
  }

  public errors(): Error[] {
    return this.blocks.filter(i => !i.isOk()).map(i => i.error);
  }

}
