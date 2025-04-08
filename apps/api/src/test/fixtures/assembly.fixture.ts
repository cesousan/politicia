import { BaseFixture } from '../utils/base.fixture'
import { getTestDbAssemblies } from './decision.fixtures'

export class AssemblyFixture extends BaseFixture {
  async load(): Promise<void> {
    const assemblies = getTestDbAssemblies()
    await this.db.insertInto('assembly').values(assemblies).execute()
  }
}
