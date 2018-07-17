import * as uuid from 'uuid';

export abstract class Msg<T = any> {
  public readonly id: string;
  public readonly tid: string;
  public constructor(tid: string = uuid.v4()) {
    this.tid = tid;
    this.id = uuid.v4();
  }

  public get type(): string {
    return this.constructor.name;
  }

  public asObj(): T {
    throw new Error('Msg asObj is not implemented');
  }

}
