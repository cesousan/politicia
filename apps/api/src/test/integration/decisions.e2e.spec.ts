import { AssemblyFixture } from '../fixtures/assembly.fixture';
import { DecisionsFixture } from '../fixtures/decisions.fixture';
import { mockDecisions } from '../fixtures/decision.fixtures';
import { TestApp } from '../utils/test-app';

describe('Decisions Integration Tests', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      new AssemblyFixture(app),
      new DecisionsFixture(app),
    ]);
  });

  afterAll(async () => {
    await app.teardown();
  });

  it('should find all decisions', async () => {
    const db = app.getDb();
    const decisions = await db.selectFrom('decision').selectAll().execute();

    expect(decisions).toHaveLength(3); // Based on our test fixtures
  });

  it('should find a decision by id', async () => {
    const db = app.getDb();
    const { id } = mockDecisions.passingDecision;
    const decision = await db
      .selectFrom('decision')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    expect(decision).toBeDefined();
    expect(decision?.id).toBe(id);
  });
});
