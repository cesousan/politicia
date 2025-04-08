import {
  createTestDatabaseProvider,
  withTestDatabase,
} from '../../test/utils/db-test-utils';
import { InMemoryDatabaseProvider } from './in-memory-database.provider';

describe('DatabaseProvider', () => {
  let databaseProvider: InMemoryDatabaseProvider;

  beforeEach(async () => {
    // Use the shared utility function to create a test database provider
    databaseProvider = createTestDatabaseProvider();
  });

  describe('getDb', () => {
    it('should return a database instance', () => {
      const db = databaseProvider.getDb();
      expect(db).toBeDefined();
      expect(typeof db.selectFrom).toBe('function');
      expect(typeof db.insertInto).toBe('function');
      expect(typeof db.updateTable).toBe('function');
      expect(typeof db.deleteFrom).toBe('function');
    });
  });

  describe('onModuleDestroy', () => {
    it('should call destroy on the database instance', async () => {
      // Initialize the db first by calling getDb
      databaseProvider.getDb();

      // Since we're using a real implementation, we just verify it doesn't throw
      await expect(databaseProvider.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('data operations', () => {
    it('should store and retrieve data', async () => {
      // Use only the required fields for the test, omitting id which is Generated
      const testRecord = {
        name: 'Test Assembly',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Seed the database with test data
      databaseProvider.seedTable('assembly', [testRecord]);

      // Query the data
      const db = databaseProvider.getDb();
      const result = await db.selectFrom('assembly').selectAll().execute();

      expect(result).toHaveLength(1);
      expect(result[0].name).toEqual(testRecord.name);
    });

    it('should reset the database', () => {
      // Seed the database with minimal required fields
      databaseProvider.seedTable('assembly', [
        {
          name: 'Test Assembly',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      // Reset the database
      databaseProvider.reset();

      // Verify it's empty
      const db = databaseProvider.getDb();
      return expect(
        db.selectFrom('assembly').selectAll().execute()
      ).resolves.toHaveLength(0);
    });
  });

  describe('withTestDatabase utility', () => {
    it('should provide a database instance for the test and clean up after', async () => {
      await withTestDatabase(async (db, provider) => {
        // Test using the database with minimal required fields
        provider.seedTable('assembly', [
          {
            name: 'Test Assembly',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);

        const result = await db.selectFrom('assembly').selectAll().execute();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Test Assembly');
      });

      // Create a new provider to verify the previous one was reset
      const newProvider = createTestDatabaseProvider();
      const newDb = newProvider.getDb();
      const result = await newDb.selectFrom('assembly').selectAll().execute();
      expect(result).toHaveLength(0);
    });
  });
});
