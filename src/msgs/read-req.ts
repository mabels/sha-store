import { PouchConfig, Match, Msg } from 'foundation-store';
import { Block } from '../types/block';
import { FragmentType } from '../types/fragment-type';
import { PouchConfigMsgInit, PouchConfigMsg } from './pouch-config-msg';
import { ShaStorePouchConfigMsg, ShaStorePouchConfigMsgInit } from './sha-store-pouch-config-msg';

export class ReadReq extends ShaStorePouchConfigMsg {

  public static is(msg: any): Match<ReadReq> {
    if (msg instanceof ReadReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<ReadReq>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: ShaStorePouchConfigMsgInit) {
    super(fwi);
  }

}
