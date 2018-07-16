import { Msg } from './msg';
import { Match } from './match';
import { PouchConnect } from './pouch-connect';

export enum FragmentType {
  FIRST = 0x1,
  COMMON = 0x2,
  LAST = 0x4,
}

export interface FragmentWriteInit {
  readonly pouchConnect: PouchConnect;
  readonly tid: string;
  readonly seq: number;
  readonly size: number;
  readonly mimeBlock: string;
  readonly fragmentType: FragmentType;
}

export class FragmentWrite extends Msg {
  public readonly pouchConnect: PouchConnect;
  public readonly seq: number;
  public readonly size: number;
  public readonly mimeBlock: string;
  public readonly fragmentType: FragmentType;

  public static is(msg: any): Match<FragmentWrite> {
    if (msg instanceof FragmentWrite) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<FragmentWrite>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: FragmentWriteInit) {
    super(fwi.tid);
    this.pouchConnect = fwi.pouchConnect;
    this.seq = fwi.seq;
    this.size = fwi.size;
    this.mimeBlock = fwi.mimeBlock;
    this.fragmentType = fwi.fragmentType;
  }

  public asBuffer(): Buffer {
    return Buffer.from(this.mimeBlock, 'base64');
  }

}
