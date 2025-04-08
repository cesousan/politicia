import { InjectionToken, NotFoundException } from '@nestjs/common'

import { AssemblyId } from '../domain/models/assembly.model'
import { ElectedOfficial, ElectedOfficialId } from '../domain/models/elected-official.model'
import { PoliticalPartyId } from '../domain/models/political-party.model'
import { ElectedOfficialsRepository } from '../ports/elected-officials-repository.interface'

export interface IElectedOfficialsService {
  findAll(): Promise<ElectedOfficial[]>
  findById(id: ElectedOfficialId): Promise<ElectedOfficial>
  findByAssembly(assemblyId: AssemblyId): Promise<ElectedOfficial[]>
  findByParty(partyId: PoliticalPartyId): Promise<ElectedOfficial[]>
  create(official: Omit<ElectedOfficial, 'id'>): Promise<ElectedOfficial>
  update(id: ElectedOfficialId, official: Partial<ElectedOfficial>): Promise<ElectedOfficial>
  delete(id: ElectedOfficialId): Promise<boolean>
}

export const ELECTED_OFFICIALS_SERVICE: InjectionToken<IElectedOfficialsService> = Symbol('ELECTED_OFFICIALS_SERVICE')

export class ElectedOfficialsService implements IElectedOfficialsService {
  constructor(private readonly electedOfficialsRepository: ElectedOfficialsRepository) {}

  async findAll(): Promise<ElectedOfficial[]> {
    return this.electedOfficialsRepository.findAll()
  }

  async findById(id: ElectedOfficialId): Promise<ElectedOfficial> {
    const official = await this.electedOfficialsRepository.findById(id)
    if (!official) {
      throw new NotFoundException(`Elected official with ID ${id} not found`)
    }
    return official
  }

  async findByAssembly(assemblyId: AssemblyId): Promise<ElectedOfficial[]> {
    return this.electedOfficialsRepository.findByAssembly(assemblyId)
  }

  async findByParty(partyId: PoliticalPartyId): Promise<ElectedOfficial[]> {
    return this.electedOfficialsRepository.findByParty(partyId)
  }

  async create(official: Omit<ElectedOfficial, 'id'>): Promise<ElectedOfficial> {
    return this.electedOfficialsRepository.create(official)
  }

  async update(id: ElectedOfficialId, official: Partial<ElectedOfficial>): Promise<ElectedOfficial> {
    const existingOfficial = await this.electedOfficialsRepository.findById(id)
    if (!existingOfficial) {
      throw new NotFoundException(`Elected official with ID ${id} not found`)
    }
    return this.electedOfficialsRepository.update(id, official)
  }

  async delete(id: ElectedOfficialId): Promise<boolean> {
    const existingOfficial = await this.electedOfficialsRepository.findById(id)
    if (!existingOfficial) {
      throw new NotFoundException(`Elected official with ID ${id} not found`)
    }
    return this.electedOfficialsRepository.delete(id)
  }
}
