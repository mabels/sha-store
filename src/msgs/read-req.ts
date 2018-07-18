import { PouchConnect, Match, Msg } from 'foundation-store';
import { Block } from '../types/block';
import { FragmentType } from '../types/fragment-type';

export interface ReadReqInit {
  readonly tid: string;
  readonly sha: string;
  readonly pouchConnect: PouchConnect;
  readonly seq: number;
  readonly fragmentType: FragmentType;
}

export class ReadReq extends Msg {
  public readonly pouchConnect: PouchConnect;
  public readonly sha: string;
  public readonly seq: number;
  public readonly block: Block;
  public readonly fragmentType: FragmentType;

  public static is(msg: any): Match<ReadReq> {
    if (msg instanceof ReadReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<ReadReq>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: ReadReqInit) {
    super(fwi.tid);
    this.pouchConnect = fwi.pouchConnect;
    this.sha = fwi.sha;
    this.seq = fwi.seq;
    this.fragmentType = fwi.fragmentType;
  }

}
