import { Msg } from './msg';
import { Match } from '../types/match';
import { PouchConnect } from '../types/pouch-connect';
import { Block } from '../types/block';
import { FragmentType } from '../types/fragment-type';

export interface FragmentWriteInit {
  readonly pouchConnect: PouchConnect;
  readonly tid: string;
  readonly seq: number;
  readonly block: Block;
  readonly fragmentType: FragmentType;
}

export class FragmentWriteReq extends Msg {
  public readonly pouchConnect: PouchConnect;
  public readonly seq: number;
  public readonly block: Block;
  public readonly fragmentType: FragmentType;

  public static is(msg: any): Match<FragmentWriteReq> {
    if (msg instanceof FragmentWriteReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<FragmentWriteReq>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: FragmentWriteInit) {
    super(fwi.tid);
    this.pouchConnect = fwi.pouchConnect;
    this.seq = fwi.seq;
    this.block = fwi.block;
    this.fragmentType = fwi.fragmentType;
  }

}
