import { PouchConnect, Match, Msg } from 'foundation-store';
import { Block } from '../types/block';
import { FragmentType } from '../types/fragment-type';

export interface WriteInit {
  readonly pouchConnect: PouchConnect;
  readonly tid: string;
  readonly seq: number;
  readonly block: Block;
  readonly fragmentType: FragmentType;
}

export class WriteReq extends Msg implements WriteInit {
  public readonly pouchConnect: PouchConnect;
  public readonly seq: number;
  public readonly block: Block;
  public readonly fragmentType: FragmentType;

  public static is(msg: any): Match<WriteReq> {
    if (msg instanceof WriteReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<WriteReq>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: WriteInit) {
    super(fwi.tid);
    this.pouchConnect = fwi.pouchConnect;
    this.seq = fwi.seq;
    this.block = fwi.block;
    this.fragmentType = fwi.fragmentType;
  }

}
