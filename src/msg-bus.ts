import * as Rx from 'rxjs';
import { Msg } from './msgs/msg';
// import { Match } from './msg/match';

// export type Combining<T extends GitHistoryMsg> = {
//   [P in keyof T]: T[P]
// };

export class MsgBus  {

  // public readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  private readonly bus: Rx.Subject<Msg> = new Rx.Subject();

  // public static combine<T extends GitHistoryMsg>(x: Combining<T>): Combined<T> {
  //   return new Combined(x);
  // }

  public next(t: Msg): void {
    this.bus.next(t);
  }

  public subscribe(cb: (msg: Msg) => void): Rx.Subscription {
    return this.bus.subscribe(cb);
  }

}
