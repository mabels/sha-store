import * as crypto from 'crypto';

export interface BlockObj {
  sha: string;
  mime: string;
}

export abstract class Block {

  private cachedSha?: string;

  public abstract asBuffer(): Buffer;

  public get length(): number {
    return this.asBuffer().length;
  }

  public asBase64(): string {
    // could be overriden to be faster
    return this.asBuffer().toString('base64');
  }

  public asString(): string {
    // could be overriden to be faster and not breaking on binary data
    return this.asBuffer().toString('utf-8');
  }

  public asSha(): string {
    return this.cachedSha ||
          (this.cachedSha = crypto.createHash('sha256').update(this.asBuffer()).digest('hex'));
  }

  public asObj(): BlockObj {
    return {
      sha: this.asSha(),
      mime: this.asBase64()
    };
  }
}
