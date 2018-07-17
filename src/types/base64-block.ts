import { Block } from './block';

export class Base64Block extends Block {
  private readonly base64: string;

  constructor(str: string) {
    super();
    this.base64 = str;
  }

  public asBuffer(): Buffer {
    return Buffer.from(this.base64, 'base64');
  }

}
