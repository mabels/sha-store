import * as uuid from 'uuid';
import { Msg } from './msg';
import { FragmentWritten } from './fragment-written';

export class Written extends Msg {
  public readonly blocks: FragmentWritten[] = [];

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
