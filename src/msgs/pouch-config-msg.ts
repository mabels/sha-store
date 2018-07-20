import { Types } from '@storemate/foundation-store';

export interface PouchConfigInit extends Types.MatchType {
  readonly config: Types.PouchConfig;
}

export class PouchConfigMsg extends Types.Typeable implements PouchConfigInit {
  public msg: Types.MsgInit;
  public readonly config: Types.PouchConfig;

  constructor(pci: PouchConfigInit) {
    super(pci);
    this.msg = Types.Msg.toObj(pci.msg);
    this.config = this.config;
  }

}
