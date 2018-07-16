// import * as PouchDB from 'pouchdb';

export interface PouchConnect {
  readonly path: string;
  readonly dbConfig?: PouchDB.Configuration.DatabaseConfiguration;
}
