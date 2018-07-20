import * as crypto from 'crypto';

export interface BlockObj {
  readonly sha: string;
  readonly mime: string;
}

export interface BlockInit {
  length: number;

  asBuffer(): Buffer;
  asBase64(): string;
  asString(): string;
  asSha(): string;
  asObj(): BlockObj;
}

export abstract class Block implements BlockInit {

  private cachedSha?: string;

  public static toObj(my: BlockObj): BlockObj {
    return {
      sha: my.sha,
      mime: my.mime
    };
  }

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
    return Block.toObj({
      sha: this.asSha(),
      mime: this.asBase64()
    });
  }
}
