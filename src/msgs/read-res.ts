import { Types } from '@storemate/foundation-store';
import { BlockObj, Block } from '../types/block';
import { SeqFragmentTypeInit, SeqFragmentType } from './seq-fragment-type';
import { MsgInit } from '../../node_modules/@storemate/foundation-store/dist/src/types';

export interface ReadResInit extends Types.MatchType {
  readonly msg: MsgInit;
  readonly sha: string;
  readonly block: BlockObj;
  readonly seqFragmentType: SeqFragmentTypeInit;
  readonly refs: Types.DbRefInit[];
}

export class ReadRes extends Types.Typeable implements ReadResInit {
  public readonly msg: MsgInit;
  public readonly sha: string;
  public readonly block: BlockObj;
  public readonly seqFragmentType: SeqFragmentTypeInit;
  public readonly refs: Types.DbRefInit[];

  public static is(msg: any): Types.Match<ReadRes> {
    if (msg instanceof ReadRes) {
      // console.log(`Match:FeedDone`, msg);
      return Types.Match.create<ReadRes>(msg);
    }
    return Types.Match.nothing();
  }

  constructor(fwi: ReadResInit) {
    super(fwi);
    this.sha = fwi.sha;
    this.block = fwi.block;
    this.refs = fwi.refs;
    this.seqFragmentType = fwi.seqFragmentType;
  }

  public asObj(): ReadResInit {
    return {
      msg: Types.Msg.toObj(this.msg),
      type: this.type,
      sha: this.sha,
      block: Block.toObj(this.block),
      seqFragmentType: SeqFragmentType.toObj(this.seqFragmentType),
      refs: this.refs
    };
  }

}
