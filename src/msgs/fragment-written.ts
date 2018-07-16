
import { Msg } from './msg';
import { FragmentType, FragmentWrite } from './fragment-write';

export class FragmentWritten extends Msg {
  public readonly error?: Error;
  public readonly sha: string;
  public readonly seq: number;
  public readonly size: number;
  public readonly fragmentType: FragmentType;

  constructor(sha: string, fwi: FragmentWrite, error?: Error) {
    super(fwi.tid);
    this.error = error;
    this.sha = sha;
    this.seq = fwi.seq;
    this.size = fwi.size;
    this.fragmentType = fwi.fragmentType;
  }

  public isOk(): boolean {
    return !this.error;
  }

}
