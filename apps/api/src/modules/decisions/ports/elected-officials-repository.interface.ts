import { InjectionToken } from '@nestjs/common'

import { ElectedOfficial, ElectedOfficialId } from '../domain/models/elected-official.model'
import { PoliticalPartyId } from '../domain/models/political-party.model'
import { AssemblyId } from '../domain/models/assembly.model'
export interface ElectedOfficialsRepository {
  findAll(): Promise<ElectedOfficial[]>
  findById(id: ElectedOfficialId): Promise<ElectedOfficial | null>
  findByAssembly(assemblyId: AssemblyId): Promise<ElectedOfficial[]>
  findByParty(partyId: PoliticalPartyId): Promise<ElectedOfficial[]>
  create(official: Omit<ElectedOfficial, 'id'>): Promise<ElectedOfficial>
  update(id: ElectedOfficialId, official: Partial<ElectedOfficial>): Promise<ElectedOfficial>
  delete(id: ElectedOfficialId): Promise<boolean>
}

export const ELECTED_OFFICIALS_REPOSITORY: InjectionToken<ElectedOfficialsRepository> =
  Symbol('ELECTED_OFFICIALS_REPOSITORY')
