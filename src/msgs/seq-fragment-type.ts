// import { PouchConfigInit, PouchConfigMsg } from './pouch-config-msg';
// import { MsgInit, Msg } from 'foundation-store';
import { FragmentType } from '../index';

export interface SeqFragmentTypeInit {
  readonly seq?: number;
  readonly fragmentType?: FragmentType;
}

export class SeqFragmentType {
  public static toObj(my: SeqFragmentTypeInit): SeqFragmentTypeInit {
    return {
      seq: my.seq,
      fragmentType: my.fragmentType
    };
  }
}

// export class SeqFragmentTypePouchConfigMsg extends Msg
//   implements SeqFragmentTypeInit, PouchConfigInit {
//   public readonly config: PouchConfigInit;
//   public readonly seq?: number;
//   public readonly fragmentType?: FragmentType;

//   constructor(sspci: SeqFragmentTypeInit) {
//     super(sspci);
//     this.config = sspci.config;
//   }

// }

// export interface ShaStorePouchConfigMsgInit extends SeqFragmentTypeInit, PouchConfigInit {
//   readonly sha: string;
// }

// export class ShaStorePouchConfigMsg extends SeqFragmentTypePouchConfigMsg implements ShaStorePouchConfigMsgInit {
//   public readonly sha: string;

//   constructor(sspci: ShaStorePouchConfigMsgInit) {
//     super(sspci);
//     this.sha = sspci.sha;
//   }

// }
