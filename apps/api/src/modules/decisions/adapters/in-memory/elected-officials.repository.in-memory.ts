import { v4 as uuidv4 } from 'uuid'

import { AssemblyId } from '../../domain/models/assembly.model'
import { ElectedOfficial, ElectedOfficialFilters, ElectedOfficialId } from '../../domain/models/elected-official.model'
import { PoliticalPartyId } from '../../domain/models/political-party.model'
import { ElectedOfficialsRepository } from '../../ports/elected-officials-repository.interface'

/**
 * In-memory implementation of the ElectedOfficialsRepository for testing purposes
 */
export class InMemoryElectedOfficialsRepository implements ElectedOfficialsRepository {
  private officials: ElectedOfficial[] = []

  async findAll(): Promise<ElectedOfficial[]> {
    return [...this.officials]
  }

  async findById(id: ElectedOfficialId): Promise<ElectedOfficial | null> {
    return this.officials.find(o => o.id === id) || null
  }

  async findByAssembly(assemblyId: AssemblyId): Promise<ElectedOfficial[]> {
    return this.officials.filter(o => o.assemblyId === assemblyId)
  }

  async findByParty(partyId: PoliticalPartyId): Promise<ElectedOfficial[]> {
    return this.officials.filter(o => o.partyId === partyId)
  }

  async create(official: Omit<ElectedOfficial, 'id'> & { id?: ElectedOfficialId }): Promise<ElectedOfficial> {
    const newOfficial: ElectedOfficial = {
      ...official,
      id: official.id || (uuidv4() as ElectedOfficialId),
    }

    this.officials.push(newOfficial)
    return newOfficial
  }

  async update(id: ElectedOfficialId, official: Partial<ElectedOfficial>): Promise<ElectedOfficial> {
    const index = this.officials.findIndex(o => o.id === id)

    if (index === -1) {
      throw new Error(`Elected official with id ${id} not found`)
    }

    this.officials[index] = {
      ...this.officials[index],
      ...official,
    }

    return this.officials[index]
  }

  async delete(id: ElectedOfficialId): Promise<boolean> {
    const initialLength = this.officials.length
    this.officials = this.officials.filter(o => o.id !== id)
    return this.officials.length < initialLength
  }

  // Helper methods for testing

  /**
   * Clears all elected officials from the repository
   */
  reset(): void {
    this.officials = []
  }

  /**
   * Find officials with optional filters
   * This is an additional helper method for testing
   */
  async findWithFilters(filters?: ElectedOfficialFilters): Promise<ElectedOfficial[]> {
    let result = [...this.officials]

    if (filters) {
      if (filters.assemblyId) {
        result = result.filter(o => o.assemblyId === filters.assemblyId)
      }

      if (filters.party) {
        result = result.filter(o => o.party.toLowerCase() === filters.party!.toLowerCase())
      }

      if (filters.position) {
        result = result.filter(o => o.position.toLowerCase() === filters.position!.toLowerCase())
      }

      if (filters.region) {
        result = result.filter(o => o.region.toLowerCase() === filters.region!.toLowerCase())
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        result = result.filter(
          o =>
            o.firstName.toLowerCase().includes(term) ||
            o.lastName.toLowerCase().includes(term) ||
            (o.bio && o.bio.toLowerCase().includes(term)),
        )
      }
    }

    return result
  }
}
