import { Block } from './block';

export class StringBlock extends Block {
  private readonly block: string;

  constructor(str: string) {
    super();
    this.block = str;
  }

  public asBuffer(): Buffer {
    return Buffer.from(this.block, 'utf-8');
  }

}
