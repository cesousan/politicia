import { InjectionToken, NotFoundException } from '@nestjs/common';

import {
  Decision,
  DecisionFilters,
  DecisionId,
  IndividualVote,
} from '../domain/models/decision.model';
import { DecisionsRepository } from '../ports/decisions-repository.interface';

export interface IDecisionsService {
  findAll(filters?: DecisionFilters): Promise<Decision[]>;
  findById(id: DecisionId): Promise<Decision>;
  findVotesByDecisionId(id: DecisionId): Promise<IndividualVote[]>;
  create(decision: Omit<Decision, 'id'>): Promise<Decision>;
  update(id: DecisionId, decision: Partial<Decision>): Promise<Decision>;
  delete(id: DecisionId): Promise<void>;
}

export const DECISIONS_SERVICE: InjectionToken<IDecisionsService> =
  Symbol('DECISIONS_SERVICE');

export class DecisionsService implements IDecisionsService {
  constructor(private readonly decisionsRepository: DecisionsRepository) {}

  async findAll(filters?: DecisionFilters): Promise<Decision[]> {
    return this.decisionsRepository.findAll(filters);
  }

  async findById(id: DecisionId): Promise<Decision> {
    const decision = await this.decisionsRepository.findById(id);
    if (!decision) {
      throw new NotFoundException(`Decision with ID ${id} not found`);
    }
    return decision;
  }

  async findVotesByDecisionId(id: DecisionId): Promise<IndividualVote[]> {
    // First check if the decision exists
    await this.findById(id);
    return this.decisionsRepository.findVotesByDecisionId(id);
  }

  async create(decision: Omit<Decision, 'id'>): Promise<Decision> {
    return this.decisionsRepository.create(decision);
  }

  async update(id: DecisionId, decision: Partial<Decision>): Promise<Decision> {
    // First check if the decision exists
    await this.findById(id);
    return this.decisionsRepository.update(id, decision);
  }

  async delete(id: DecisionId): Promise<void> {
    // First check if the decision exists
    await this.findById(id);
    const deleted = await this.decisionsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Decision with ID ${id} not found`);
    }
  }
}
