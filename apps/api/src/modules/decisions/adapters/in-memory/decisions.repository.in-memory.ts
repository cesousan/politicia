import { v4 as uuidv4 } from 'uuid'

import { Decision, DecisionFilters, DecisionId } from '../../domain/models/decision.model'
import { IndividualVote } from '../../domain/models/vote.model'
import { DecisionsRepository } from '../../ports/decisions-repository.interface'

/**
 * In-memory implementation of the DecisionsRepository for testing purposes
 */
export class InMemoryDecisionsRepository implements DecisionsRepository {
  private decisions: Decision[] = []
  private votes: IndividualVote[] = []

  async findAll(filters?: DecisionFilters): Promise<Decision[]> {
    let result = [...this.decisions]

    if (filters) {
      if (filters.assemblyId) {
        result = result.filter(d => d.assemblyId === filters.assemblyId)
      }

      if (filters.dateFrom) {
        result = result.filter(d => d.date >= filters.dateFrom!)
      }

      if (filters.dateTo) {
        result = result.filter(d => d.date <= filters.dateTo!)
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        result = result.filter(
          d =>
            d.title.toLowerCase().includes(term) ||
            d.summary.toLowerCase().includes(term) ||
            (d.fullText && d.fullText.toLowerCase().includes(term)),
        )
      }
    }

    return result
  }

  async findById(id: DecisionId): Promise<Decision | null> {
    return this.decisions.find(d => d.id === id) || null
  }

  async findVotesByDecisionId(decisionId: DecisionId): Promise<IndividualVote[]> {
    return this.votes.filter(v => v.decisionId === decisionId)
  }

  async create(decision: Omit<Decision, 'id'> & { id?: DecisionId }): Promise<Decision> {
    const newDecision: Decision = {
      ...decision,
      id: decision.id || (uuidv4() as DecisionId),
    }

    this.decisions.push(newDecision)
    return newDecision
  }

  async update(id: DecisionId, decision: Partial<Decision>): Promise<Decision> {
    const index = this.decisions.findIndex(d => d.id === id)

    if (index === -1) {
      throw new Error(`Decision with id ${id} not found`)
    }

    this.decisions[index] = {
      ...this.decisions[index],
      ...decision,
    }

    return this.decisions[index]
  }

  async delete(id: DecisionId): Promise<boolean> {
    const initialLength = this.decisions.length
    this.decisions = this.decisions.filter(d => d.id !== id)

    // Also delete all votes associated with this decision
    this.votes = this.votes.filter(v => v.decisionId !== id)

    return this.decisions.length < initialLength
  }

  // Helper methods for testing

  /**
   * Adds a vote to the in-memory store
   */
  addVote(vote: IndividualVote): void {
    this.votes.push(vote)
  }

  /**
   * Clears all decisions and votes from the repository
   */
  reset(): void {
    this.decisions = []
    this.votes = []
  }
}
