import { Kysely } from 'kysely';

import { Database } from '../../infrastructure/postgres/database.types';

import { TestApp } from './test-app';
import { IFixture } from './fixture';

export abstract class BaseFixture implements IFixture {
  protected db: Kysely<Database>;

  constructor(protected app: TestApp) {
    this.db = app.getDb();
  }

  abstract load(): Promise<void>;
}
