import { ConfigService } from '@nestjs/config';
import { Kysely } from 'kysely';

import { DATABASE_PROVIDER } from '../../infrastructure/postgres/database.provider';
import { Database } from '../../infrastructure/postgres/database.types';
import { InMemoryDatabaseProvider } from '../../infrastructure/postgres/in-memory-database.provider';
import { Decision } from '../../modules/decisions/domain/models/decision.model';
import { ElectedOfficial } from '../../modules/decisions/domain/models/elected-official.model';

/**
 * Creates a test config service
 * @returns A simple ConfigService implementation for testing
 */
export function createTestConfigService(): ConfigService {
  const configValues = {
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_USERNAME: 'test_user',
    DB_PASSWORD: 'test_password',
    DB_DATABASE: 'test_db',
  };

  return {
    get: (key: string) => configValues[key as keyof typeof configValues],
  } as ConfigService;
}

/**
 * Creates an in-memory database provider for tests
 * @returns An InMemoryDatabaseProvider instance
 */
export function createTestDatabaseProvider(): InMemoryDatabaseProvider {
  const configService = createTestConfigService();
  return new InMemoryDatabaseProvider(configService);
}

/**
 * Provides test dependencies with an in-memory database
 * @returns NestJS providers with the DATABASE_PROVIDER token
 */
export function provideTestDatabase() {
  return [
    {
      provide: DATABASE_PROVIDER,
      useFactory: () => createTestDatabaseProvider(),
    },
  ];
}

/**
 * Type for seeding various database tables
 */
export interface TestData {
  assemblies?: Array<Record<string, any>>;
  politicalParties?: Array<Record<string, any>>;
  electedOfficials?: Array<Record<string, any>>;
  decisions?: Array<Record<string, any>>;
  individualVotes?: Array<Record<string, any>>;
}

/**
 * Seeds the in-memory database with test data
 * @param dbProvider The database provider to seed
 * @param data The test data to seed
 */
export function seedTestDatabase(
  dbProvider: InMemoryDatabaseProvider,
  data: TestData
): void {
  if (data.assemblies?.length) {
    dbProvider.seedTable('assembly', data.assemblies);
  }

  if (data.politicalParties?.length) {
    dbProvider.seedTable('political_party', data.politicalParties);
  }

  if (data.electedOfficials?.length) {
    dbProvider.seedTable('elected_official', data.electedOfficials);
  }

  if (data.decisions?.length) {
    dbProvider.seedTable('decision', data.decisions);
  }

  if (data.individualVotes?.length) {
    dbProvider.seedTable('individual_vote', data.individualVotes);
  }
}

/**
 * Converts a domain Decision model to a database row format
 * @param decision The decision model to convert
 * @returns The database row format of the decision
 */
export function decisionToDbRow(decision: Decision): Record<string, any> {
  return {
    id: decision.id,
    title: decision.title,
    summary: decision.summary,
    fullText: decision.fullText,
    date: decision.date,
    source: decision.source,
    assembly_id: decision.assemblyId,
    in_favor: decision.resultsOverview.inFavor,
    against: decision.resultsOverview.against,
    abstention: decision.resultsOverview.abstention,
    absent: decision.resultsOverview.absent,
    total_voters: decision.resultsOverview.totalVoters,
    is_passed: decision.resultsOverview.isPassed,
  };
}

/**
 * Converts a domain ElectedOfficial model to a database row format
 * @param official The elected official model to convert
 * @returns The database row format of the elected official
 */
export function officialToDbRow(
  official: ElectedOfficial
): Record<string, any> {
  return {
    id: official.id,
    first_name: official.firstName,
    last_name: official.lastName,
    party: official.party,
    party_id: official.partyId,
    position: official.position,
    region: official.region,
    bio: official.bio,
    assembly_id: official.assemblyId,
    contact_info: official.contactInfo
      ? JSON.stringify(official.contactInfo)
      : null,
  };
}

/**
 * Gets a test database instance
 * @param dbProvider The database provider
 * @returns A Kysely database instance
 */
export function getTestDb(
  dbProvider: InMemoryDatabaseProvider
): Kysely<Database> {
  return dbProvider.getDb();
}

/**
 * Executes a test with a fresh database
 * @param callback Function to execute with the database
 * @returns The result of the callback function
 */
export async function withTestDatabase<T>(
  callback: (
    db: Kysely<Database>,
    dbProvider: InMemoryDatabaseProvider
  ) => Promise<T>
): Promise<T> {
  const dbProvider = createTestDatabaseProvider();
  const db = getTestDb(dbProvider);
  try {
    return await callback(db, dbProvider);
  } finally {
    dbProvider.reset();
  }
}
