
import { Msg, Match } from 'foundation-store';
import { FragmentType } from '../types/fragment-type';

export interface WriteResObj {
  readonly error?: Error;
  readonly _id: string;
  readonly created: string;
  readonly tid: string;
  readonly sha: string;
  readonly seq: number;
  readonly fragmentType: FragmentType;
}

export class WriteRes extends Msg implements WriteResObj {
  public readonly error?: Error;
  public readonly _id: string;
  public readonly created: string;
  public readonly sha: string;
  public readonly seq: number;
  public readonly fragmentType: FragmentType;

  public static is(msg: any): Match<WriteRes> {
    if (msg instanceof WriteRes) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<WriteRes>(msg);
    }
    return Match.nothing();
  }

  constructor(fwso: WriteResObj) {
    super(fwso.tid);
    this._id = fwso._id;
    this.created = fwso.created;
    this.error = fwso.error;
    this.sha = fwso.sha;
    this.seq = fwso.seq;
    this.fragmentType = fwso.fragmentType;
  }

  public isOk(): boolean {
    return !this.error;
  }

  public asObj(): WriteResObj {
    return {
      tid: this.tid,
      _id: this._id,
      created: this.created,
      sha: this.sha,
      seq: this.seq,
      fragmentType: this.fragmentType,
      error: this.error
    };
  }

}
