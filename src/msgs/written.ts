import * as uuid from 'uuid';
import { Msg } from './msg';
import { FragmentWritten } from './fragment-written';
import { Match } from './match';

export class Written extends Msg {
  public readonly blocks: FragmentWritten[] = [];

  public static is(msg: any): Match<Written> {
    if (msg instanceof Written) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<Written>(msg);
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
