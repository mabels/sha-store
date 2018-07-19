import { FragmentType } from '..';

export interface ShaStoreInit {
  readonly sha: string;
  readonly seq?: number;
  readonly fragmentType?: FragmentType;
}
