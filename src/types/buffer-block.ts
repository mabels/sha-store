import { Block } from './block';

export class BufferBlock extends Block {
  private readonly buffer: Buffer;

  constructor(str: Buffer) {
    super();
    this.buffer = str;
  }

  public asBuffer(): Buffer {
    return this.buffer;
  }

}
