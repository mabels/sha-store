import { Types } from '@storemate/foundation-store';
import { PouchConfigInit } from './pouch-config-msg';
import { SeqFragmentTypeInit } from './seq-fragment-type';
import { MsgInit } from '../../node_modules/@storemate/foundation-store/dist/src/types';

export interface ReadReqInit extends
  Types.MatchType, PouchConfigInit {
  readonly sha: string;
  readonly seqFragmentType: SeqFragmentTypeInit;
}

export class ReadReq extends Types.Typeable implements ReadReqInit {
  public readonly msg: MsgInit;
  public readonly sha: string;
  public readonly config: Types.PouchConfig;
  public readonly seqFragmentType: SeqFragmentTypeInit;

  public static is(msg: any): Types.Match<ReadReq> {
    if (msg instanceof ReadReq) {
      // console.log(`Match:FeedDone`, msg);
      return Types.Match.create<ReadReq>(msg);
    }
    return Types.Match.nothing();
  }

  constructor(fwi: ReadReqInit) {
    super(fwi);
    this.msg = Types.Msg.toObj(fwi.msg);
    this.sha = fwi.sha;
    this.config = new Types.PouchConfig(fwi.config);
    this.seqFragmentType = fwi.seqFragmentType;
  }

}
