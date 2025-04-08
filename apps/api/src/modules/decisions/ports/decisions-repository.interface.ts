import { InjectionToken } from '@nestjs/common'
import { Decision, DecisionFilters, DecisionId, IndividualVote } from '../domain/models/decision.model'

export interface DecisionsRepository {
  findAll(filters?: DecisionFilters): Promise<Decision[]>
  findById(id: DecisionId): Promise<Decision | null>
  findVotesByDecisionId(decisionId: DecisionId): Promise<IndividualVote[]>
  create(decision: Omit<Decision, 'id'>): Promise<Decision>
  update(id: DecisionId, decision: Partial<Decision>): Promise<Decision>
  delete(id: DecisionId): Promise<boolean>
}

export const DECISIONS_REPOSITORY: InjectionToken<DecisionsRepository> = Symbol('DECISIONS_REPOSITORY')
