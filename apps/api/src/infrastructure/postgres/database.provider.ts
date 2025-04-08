import { InjectionToken } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { Database } from './database.types';

export const DATABASE_PROVIDER: InjectionToken<DatabaseProvider> =
  Symbol('DATABASE_PROVIDER');

export class DatabaseProvider {
  private db: Kysely<Database>;

  constructor(private configService: ConfigService) {}

  getDb(): Kysely<Database> {
    if (!this.db) {
      this.#initializeDb();
    }
    return this.db;
  }

  #initializeDb() {
    const dialect = new PostgresDialect({
      pool: new Pool({
        host: this.configService.get<string>('DB_HOST'),
        port: this.configService.get<number>('DB_PORT'),
        user: this.configService.get<string>('DB_USERNAME'),
        password: this.configService.get<string>('DB_PASSWORD'),
        database: this.configService.get<string>('DB_DATABASE'),
      }),
    });

    this.db = new Kysely<Database>({
      dialect,
    });
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }
}
