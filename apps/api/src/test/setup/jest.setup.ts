import { startDocker, stopDocker } from './docker-manager';

// Increase timeout for all tests
jest.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

// Start PostgreSQL container before all tests
beforeAll(async () => {
  console.log('Starting PostgreSQL container');
  await startDocker();
});

// Stop PostgreSQL container after all tests
afterAll(async () => {
  console.log('Stopping PostgreSQL container');
  await stopDocker();
});
