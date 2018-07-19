import { PouchConfig } from '../../node_modules/foundation-store';
import { MsgInit, Msg } from '../../node_modules/foundation-store/dist/src/types/msg';

export interface PouchConfigMsgInit extends MsgInit {
  readonly config: PouchConfig;
}

export class PouchConfigMsg extends Msg implements PouchConfigMsgInit {
  public readonly config: PouchConfig;

  constructor(pci: PouchConfigMsgInit) {
    super(pci);
    this.config = this.config;
  }

}
