import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  getTestDecisions,
  getTestVotes,
  mockDecisions,
} from '../../../test/fixtures/decision.fixtures';
import { provideTestDatabase } from '../../../test/utils/db-test-utils';

import { InMemoryDecisionsRepository } from '../adapters/in-memory/decisions.repository.in-memory';
import { Decision, DecisionId } from '../domain/models/decision.model';
import {
  DECISIONS_REPOSITORY,
  DecisionsRepository,
} from '../ports/decisions-repository.interface';
import {
  DECISIONS_SERVICE,
  DecisionsService,
  IDecisionsService,
} from './decisions.service';

describe('DecisionsService', () => {
  let decisionsService: IDecisionsService;
  let decisionsRepository: InMemoryDecisionsRepository;

  beforeEach(async () => {
    // Setup test module with in-memory repository
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DECISIONS_REPOSITORY,
          useClass: InMemoryDecisionsRepository,
        },
        {
          provide: DECISIONS_SERVICE,
          useFactory: (repository: DecisionsRepository) =>
            new DecisionsService(repository),
          inject: [DECISIONS_REPOSITORY],
        },
        // Add the test database provider for any components that might need it
        ...provideTestDatabase(),
      ],
    }).compile();

    decisionsService = moduleRef.get<IDecisionsService>(DECISIONS_SERVICE);
    decisionsRepository = moduleRef.get<DecisionsRepository>(
      DECISIONS_REPOSITORY
    ) as InMemoryDecisionsRepository;

    // Initialize repository with test data
    decisionsRepository.reset();
    getTestDecisions().forEach((decision) => {
      decisionsRepository.create(decision);
    });

    getTestVotes().forEach((vote) => {
      decisionsRepository.addVote(vote);
    });
  });

  describe('findAll', () => {
    it('should return an array of decisions', async () => {
      const decisions = await decisionsService.findAll();
      expect(decisions).toBeInstanceOf(Array);
      expect(decisions.length).toBeGreaterThan(0);
    });

    it('should filter decisions by assembly ID', async () => {
      const decisions = await decisionsService.findAll({
        assemblyId: 'assembly-1',
      });
      expect(
        decisions.every((d) => d.assemblyId === 'assembly-1')
      ).toBeTruthy();
    });

    it('should filter decisions by date range', async () => {
      const dateFrom = new Date('2023-01-01');
      const dateTo = new Date('2023-06-30');

      const decisions = await decisionsService.findAll({
        dateFrom,
        dateTo,
      });

      expect(
        decisions.every((d) => d.date >= dateFrom && d.date <= dateTo)
      ).toBeTruthy();
    });

    it('should filter decisions by search term', async () => {
      const searchTerm = 'climate';
      const decisions = await decisionsService.findAll({ searchTerm });

      expect(decisions.length).toBeGreaterThan(0);
      expect(
        decisions.every(
          (d) =>
            d.title.toLowerCase().includes(searchTerm) ||
            d.summary.toLowerCase().includes(searchTerm) ||
            (d.fullText && d.fullText.toLowerCase().includes(searchTerm))
        )
      ).toBeTruthy();
    });
  });

  describe('findById', () => {
    it('should return a decision when it exists', async () => {
      const existingDecisionId = mockDecisions.passingDecision.id;
      const foundDecision = await decisionsService.findById(existingDecisionId);

      expect(foundDecision).toBeDefined();
      expect(foundDecision.id).toBe(existingDecisionId);
    });

    it('should throw NotFoundException when decision does not exist', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(decisionsService.findById(nonExistentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findVotesByDecisionId', () => {
    it('should return votes for a given decision ID', async () => {
      const decisionId = mockDecisions.passingDecision.id;
      const votes = await decisionsService.findVotesByDecisionId(decisionId);

      expect(votes).toBeInstanceOf(Array);
      expect(votes.length).toBeGreaterThan(0);
      expect(votes.every((v) => v.decisionId === decisionId)).toBeTruthy();
    });

    it('should throw NotFoundException when decision does not exist', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(
        decisionsService.findVotesByDecisionId(nonExistentId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new decision', async () => {
      const newDecision: Omit<Decision, 'id'> = {
        title: 'New Decision Title',
        summary: 'Summary of the new decision',
        fullText: 'Full text of the new decision...',
        date: new Date(),
        source: 'https://example.com/source',
        assemblyId: 'assembly-1',
        resultsOverview: {
          inFavor: 200,
          against: 180,
          abstention: 30,
          absent: 17,
          totalVoters: 427,
          isPassed: true,
        },
      };

      const createdDecision = await decisionsService.create(newDecision);

      expect(createdDecision).toBeDefined();
      expect(createdDecision.id).toBeDefined();
      expect(createdDecision.title).toBe(newDecision.title);

      // Verify it was added to the repository
      const foundDecision = await decisionsService.findById(createdDecision.id);
      expect(foundDecision).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an existing decision', async () => {
      const existingDecisionId = mockDecisions.passingDecision.id;
      const updateData = {
        title: 'Updated Title',
        summary: 'Updated summary',
      };

      const updatedDecision = await decisionsService.update(
        existingDecisionId,
        updateData
      );

      expect(updatedDecision).toBeDefined();
      expect(updatedDecision.id).toBe(existingDecisionId);
      expect(updatedDecision.title).toBe(updateData.title);
      expect(updatedDecision.summary).toBe(updateData.summary);

      // Other properties should remain unchanged
      const originalDecision = mockDecisions.passingDecision;
      expect(updatedDecision.assemblyId).toBe(originalDecision.assemblyId);
    });

    it('should throw NotFoundException when decision does not exist', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(
        decisionsService.update(nonExistentId, { title: 'Updated Title' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing decision', async () => {
      const existingDecisionId = mockDecisions.passingDecision.id;

      // Verify it exists before deletion
      const decisionBeforeDeletion = await decisionsService.findById(
        existingDecisionId
      );
      expect(decisionBeforeDeletion).toBeDefined();

      await decisionsService.delete(existingDecisionId);

      // Verify it no longer exists
      await expect(
        decisionsService.findById(existingDecisionId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when decision does not exist', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(decisionsService.delete(nonExistentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
