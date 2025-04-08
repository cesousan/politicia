import { BaseFixture } from '../utils/base.fixture'
import { getTestDbDecisions } from './decision.fixtures'

export class DecisionsFixture extends BaseFixture {
  async load(): Promise<void> {
    const decisions = getTestDbDecisions()
    await this.db.insertInto('decision').values(decisions).execute()
  }
}
