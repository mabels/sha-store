import { Types } from '@storemate/foundation-store';
import { Block, BlockInit, BlockObj } from '../types/block';
import { PouchConfigInit, PouchConfigMsg } from './pouch-config-msg';
import { SeqFragmentTypeInit, SeqFragmentType } from './seq-fragment-type';
import { FragmentType } from '../types/fragment-type';
import { MsgInit } from '../../node_modules/@storemate/foundation-store/dist/src/types';

export interface WriteReqInit extends Types.MatchType {
  readonly block: BlockObj;
  readonly config: Types.PouchConfigInit;
  readonly seqFragment: SeqFragmentTypeInit;
}

export class WriteReq extends Types.Typeable implements WriteReqInit {
  public readonly msg: MsgInit;
  public readonly block: BlockObj;
  public readonly config: Types.PouchConfigInit;
  public readonly seqFragment: SeqFragmentTypeInit;

  public static is(msg: any): Types.Match<WriteReq> {
    if (msg instanceof WriteReq) {
      // console.log(`Match:FeedDone`, msg);
      return Types.Match.create<WriteReq>(msg);
    }
    return Types.Match.nothing();
  }

  constructor(fwi: WriteReqInit) {
    super(fwi);
    this.msg = Types.Msg.toObj(fwi.msg);
    this.block = fwi.block;
    this.config = fwi.config;
    this.seqFragment = fwi.seqFragment;
  }

}
