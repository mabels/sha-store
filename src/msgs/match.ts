import { Msg } from './msg';

export class Match<T extends Msg> {
  public readonly msg: T;

  public static create<T extends Msg>(t: T): Match<T> {
    return new Match(t);
  }

  public static nothing<T extends Msg>(): Match<T> {
    return new Match(null);
  }

  private constructor(t: T) {
    // console.log('Match:', t);
    this.msg = t;
  }

  public hasTid(msg: Msg | string): Match<T> {
    let msgTid: string;
    if ((msg instanceof Msg) && this.msg) {
      msgTid = msg.tid;
    } else if (typeof (msg) == 'string') {
      msgTid = msg;
    }
    if (this.msg && msgTid === this.msg.tid) {
      return this;
    }
    return Match.nothing();
  }

  public match(cb: (t: T) => void): void {
    if (this.msg) {
      cb(this.msg);
    }
  }
}
