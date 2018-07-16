import * as uuid from 'uuid';
import { Msg } from './msg';

export class Write extends Msg {
  public readonly mimeblock: string;

  public static string(str: string, tid = uuid.v4()): Write {
    return Write.buffer(Buffer.from(str, 'utf8'), tid);
  }

  public static buffer(buff: Buffer, tid = uuid.v4()): Write {
    return Write.base64(buff.toString('base64'), tid);
  }

  public static base64(buff: string, tid = uuid.v4()): Write {
    return new Write(buff, tid);
  }

  constructor(block: string, tid = uuid.v4()) {
    super(tid);
    this.mimeblock = block;
  }

}
