import * as uuid from 'uuid';
import { Msg } from './msg';

export enum FragmentType {
  FIRST = 0x1,
  COMMON = 0x2,
  LAST = 0x4,
}

export interface FragmentWriteInit {
  readonly tid?: string;
  readonly seq: number;
  readonly size: number;
  readonly mimeBlock: string;
  readonly fragmentType: FragmentType;
}

export class FragmentWrite extends Msg {
  public readonly seq: number;
  public readonly size: number;
  public readonly mimeBlock: string;
  public readonly fragmentType: FragmentType;

  constructor(fwi: FragmentWriteInit, tid = uuid.v4()) {
    super(fwi.tid || tid);
    this.seq = fwi.seq;
    this.size = fwi.size;
    this.mimeBlock = fwi.mimeBlock;
    this.fragmentType = fwi.fragmentType;
  }

}
