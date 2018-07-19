import { PouchConfig, Match, Msg } from 'foundation-store';
import { Block } from '../types/block';
import { FragmentType } from '../types/fragment-type';
import { MsgInit } from '../../node_modules/foundation-store/dist/src/types/msg';
import { PouchConfigMsgInit, PouchConfigMsg } from './pouch-config-msg';
import { ShaStorePouchConfigMsgInit, ShaStorePouchConfigMsg } from './sha-store-pouch-config-msg';

export interface WriteReqInit extends ShaStorePouchConfigMsgInit {
  readonly block: Block;
}

export class WriteReq extends ShaStorePouchConfigMsg implements WriteReqInit {
  public readonly block: Block;

  public static is(msg: any): Match<WriteReq> {
    if (msg instanceof WriteReq) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<WriteReq>(msg);
    }
    return Match.nothing();
  }

  constructor(fwi: WriteReqInit) {
    super(fwi);
    this.block = fwi.block;
  }

}
