
import { Types } from '@storemate/foundation-store';
import { SeqFragmentTypeInit, SeqFragmentType } from './seq-fragment-type';

export interface WriteResInit extends Types.MatchType {
  readonly seqFragment: SeqFragmentTypeInit;
  readonly dbRefs: Types.DbRefInit[];
  readonly sha: string;
}

export class WriteRes extends Types.Typeable implements WriteResInit {
  public readonly msg: Types.MsgInit;
  public readonly sha: string;
  public readonly seqFragment: SeqFragmentTypeInit;
  public readonly dbRefs: Types.DbRefInit[];

  public static is(msg: any): Types.Match<WriteRes> {
    if (msg instanceof WriteRes) {
      // console.log(`Match:FeedDone`, msg);
      return Types.Match.create<WriteRes>(msg);
    }
    return Types.Match.nothing();
  }

  constructor(fwso: WriteResInit) {
    super(fwso);
    this.msg = Types.Msg.toObj(fwso.msg);
    this.sha = fwso.sha;
    this.seqFragment = SeqFragmentType.toObj(fwso.seqFragment);
    this.dbRefs = fwso.dbRefs.map(i => Types.DbRef.toObj(i));
  }

  public asObj(): WriteResInit {
    return {
      msg: Types.Msg.toObj(this.msg),
      dbRefs: this.dbRefs,
      sha: this.sha,
      seqFragment: this.seqFragment,
    };
  }

}
