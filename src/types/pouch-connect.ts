// import * as PouchDB from 'pouchdb';

export interface PouchConnectObj {
  readonly path: string;
  readonly dbConfig?: PouchDB.Configuration.DatabaseConfiguration;
}

export class PouchConnect implements PouchConnectObj {
  public readonly path: string;
  public readonly dbConfig?: PouchDB.Configuration.DatabaseConfiguration;

  constructor(pci: PouchConnectObj) {
    this.path = pci.path;
    this.dbConfig = pci.dbConfig;
  }

  public asObj(): PouchConnectObj {
    return {
      path: this.path,
      dbConfig: this.dbConfig
    };
  }

}
