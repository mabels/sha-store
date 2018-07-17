import { Msg } from './msg';
import { Match } from '../types/match';
import { PouchConnect } from '../types/pouch-connect';
import { Block } from '../types/block';
import { FragmentType } from '../types/fragment-type';

export interface FragmentReadReqInit {
  readonly tid: string;
  readonly sha: string;
  readonly pouchConnect: PouchConnect;
  readonly seq: number;
  readonly ofs?: number;
  readonly size?: number;
  readonly fragmentType: FragmentType;
}

export class FragmentReadReq extends Msg {
  public readonly pouchConnect: PouchConnect;
  public readonly sha: string;
  public readonly seq: number;
  public readonly ofs?: number;
  public readonly size?: number;
  public readonly block: Block;
  public readonly fragmentType: FragmentType;

  public static is(msg: any): Match<FragmentReadReq> {
    if (msg instanceof FragmentReadReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<FragmentReadReq>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: FragmentReadReqInit) {
    super(fwi.tid);
    this.pouchConnect = fwi.pouchConnect;
    this.sha = fwi.sha;
    this.seq = fwi.seq;
    this.size = fwi.size;
    this.ofs = fwi.ofs;
    this.fragmentType = fwi.fragmentType;
  }

}
