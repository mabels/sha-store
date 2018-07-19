import { PouchConfigMsgInit, PouchConfigMsg } from './pouch-config-msg';
import { ShaStoreInit } from './sha-store';
import { PouchConfig } from '../../node_modules/foundation-store';
import { FragmentType } from '..';

export interface ShaStorePouchConfigMsgInit extends ShaStoreInit, PouchConfigMsgInit {
}

export class ShaStorePouchConfigMsg extends PouchConfigMsg implements ShaStorePouchConfigMsgInit {
  public readonly sha: string;
  public readonly seq?: number;
  public readonly fragmentType?: FragmentType;

  constructor(sspci: ShaStorePouchConfigMsgInit) {
    super(sspci);
    this.sha = sspci.sha;
    this.seq = sspci.seq;
    this.fragmentType = sspci.fragmentType;
  }

}
