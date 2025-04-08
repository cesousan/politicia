// test-connection.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { DATABASE_PROVIDER } from '../../../src/infrastructure/postgres/database.provider';
import { MainModule } from '../../main.module';

async function testConnection() {
  console.log('Testing database connection...');

  // Start the application
  const app = await NestFactory.create(MainModule, new FastifyAdapter());
  await app.init();

  try {
    // Test the database connection
    const dbProvider = app.get(DATABASE_PROVIDER);
    const db = dbProvider.getDb();

    // Run a simple query - adjust this to match your schema
    const result = await db
      .selectFrom('decision')
      .selectAll()
      .limit(1)
      .execute();

    console.log('Connection successful! Result:', result);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  } finally {
    await app.close();
  }
}

testConnection().then((success) => {
  if (!success) {
    process.exit(1);
  }
});
