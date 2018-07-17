import { Msg } from './msg';
import { Match } from '../types/match';
import { PouchConnect, PouchConnectObj } from '../types/pouch-connect';
import { Block, BlockObj } from '../types/block';
import { FragmentType } from '../types/fragment-type';

export interface DocId {
  readonly _id: string;
  readonly created: string;
}
export interface FragmentReadResObj {
  readonly pouchConnect: PouchConnectObj;
  readonly ids: DocId[];
  readonly sha: string;
  readonly tid: string;
  readonly seq: number;
  readonly block: BlockObj;
  readonly fragmentType: FragmentType;
  readonly error?: Error;
}

export interface FragmentReadResInit {
  readonly pouchConnect: PouchConnect;
  readonly ids: DocId[];
  readonly sha: string;
  readonly tid: string;
  readonly seq: number;
  readonly block: Block;
  readonly fragmentType: FragmentType;
  readonly error?: Error;
}

export class FragmentReadRes extends Msg implements FragmentReadResInit {
  public readonly pouchConnect: PouchConnect;
  public readonly ids: DocId[];
  public readonly sha: string;
  public readonly seq: number;
  public readonly block: Block;
  public readonly fragmentType: FragmentType;
  public readonly error?: Error;

  public static is(msg: any): Match<FragmentReadRes> {
    if (msg instanceof FragmentReadRes) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<FragmentReadRes>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: FragmentReadResInit) {
    super(fwi.tid);
    this.pouchConnect = fwi.pouchConnect;
    this.ids = fwi.ids;
    this.sha = fwi.sha;
    this.seq = fwi.seq;
    this.block = fwi.block;
    this.fragmentType = fwi.fragmentType;
    this.error = fwi.error;
  }

  public isOk(): boolean {
    return !!this.error;
  }

  public asObj(): FragmentReadResObj {
    return {
      tid: this.tid,
      ids: this.ids,
      sha: this.sha,
      pouchConnect: this.pouchConnect.asObj(),
      seq: this.seq,
      block: this.block.asObj(),
      fragmentType: this.fragmentType,
      error: this.error
    };
  }

}
