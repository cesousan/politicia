import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { Kysely } from 'kysely';

import { AppModule } from '../../core/app.module';
import { DATABASE_PROVIDER } from '../../infrastructure/postgres/database.provider';
import { Database } from '../../infrastructure/postgres/database.types';
import { runMigrations } from '../../infrastructure/postgres/migrations/migration';
import { getPostgresConnectionString } from '../setup/docker-manager';
import { IFixture } from './fixture';

export class TestApp {
  private app: INestApplication | null = null;
  private db: Kysely<Database>;

  async setup() {
    // Set up environment variables for the migrations
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'test_user';
    process.env.DB_PASSWORD = 'test_password';
    process.env.DB_DATABASE = 'politicia_test';

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              DATABASE_URL: getPostgresConnectionString(),
              DB_HOST: 'localhost',
              DB_PORT: 5432,
              DB_USERNAME: 'test_user',
              DB_PASSWORD: 'test_password',
              DB_DATABASE: 'politicia_test',
            }),
          ],
        }),
        AppModule,
      ],
    }).compile();
    this.app = module.createNestApplication(new FastifyAdapter());
    await this.app.init();

    // Get the database instance
    this.db = this.app.get(DATABASE_PROVIDER).getDb();

    // Run migrations to set up the database schema
    await runMigrations();
  }

  async teardown() {
    await this.clearDatabase();
    await this.app?.close();
  }

  async loadFixtures(fixtures: IFixture[]) {
    return Promise.all(fixtures.map((fixture) => fixture.load(this)));
  }

  get<T>(name: any) {
    return this.app?.get<T>(name);
  }

  getHttpServer() {
    return this.app?.getHttpServer();
  }

  getDb() {
    return this.db;
  }

  private async clearDatabase() {
    if (this.db) {
      // Drop all tables to clean up
      try {
        // Use reverse order to handle foreign key constraints
        await this.db.schema.dropTable('individual_vote').ifExists().execute();
        await this.db.schema.dropTable('decision').ifExists().execute();
        await this.db.schema.dropTable('elected_official').ifExists().execute();
        await this.db.schema.dropTable('political_party').ifExists().execute();
        await this.db.schema.dropTable('assembly').ifExists().execute();
      } catch (error) {
        console.warn('Error dropping tables:', error);
      }

      await this.db.destroy();
    }
  }
}
