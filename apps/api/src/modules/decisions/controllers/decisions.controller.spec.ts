import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { v4 as uuidv4 } from 'uuid';

import {
  getTestDecisions,
  getTestVotes,
  mockDecisions,
} from '../../../test/fixtures/decision.fixtures';
import { provideTestDatabase } from '../../../test/utils/db-test-utils';

import { InMemoryDecisionsRepository } from '../adapters/in-memory/decisions.repository.in-memory';
import { Decision, DecisionId } from '../domain/models/decision.model';
import { DECISIONS_REPOSITORY } from '../ports/decisions-repository.interface';
import {
  DECISIONS_SERVICE,
  DecisionsService,
} from '../services/decisions.service';
import { DecisionsController } from './decisions.controller';

describe('DecisionsController', () => {
  let controller: DecisionsController;
  let repository: InMemoryDecisionsRepository;

  beforeEach(async () => {
    // Create the test module with actual service and in-memory repository
    const moduleRef = await Test.createTestingModule({
      controllers: [DecisionsController],
      providers: [
        {
          provide: DECISIONS_REPOSITORY,
          useClass: InMemoryDecisionsRepository,
        },
        {
          provide: DECISIONS_SERVICE,
          useFactory: (repository) => new DecisionsService(repository),
          inject: [DECISIONS_REPOSITORY],
        },
        // Add the test database provider for any components that might need it
        ...provideTestDatabase(),
      ],
    }).compile();

    controller = moduleRef.get<DecisionsController>(DecisionsController);
    repository = moduleRef.get(
      DECISIONS_REPOSITORY
    ) as InMemoryDecisionsRepository;

    // Initialize repository with test data
    repository.reset();
    getTestDecisions().forEach((decision) => {
      repository.create(decision);
    });

    getTestVotes().forEach((vote) => {
      repository.addVote(vote);
    });
  });

  describe('findAll', () => {
    it('should return an array of decisions', async () => {
      const filters = { searchTerm: 'climate' };
      const result = await controller.findAll(filters);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          (d) =>
            d.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            d.summary
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            (d.fullText &&
              d.fullText
                .toLowerCase()
                .includes(filters.searchTerm.toLowerCase()))
        )
      ).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single decision when it exists', async () => {
      const existingDecisionId = mockDecisions.passingDecision.id;
      const result = await controller.findOne(existingDecisionId);

      expect(result).toBeDefined();
      expect(result.id).toBe(existingDecisionId);
    });

    it('should throw NotFoundException when decision does not exist', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findVotes', () => {
    it('should return votes for a decision', async () => {
      const decisionId = mockDecisions.passingDecision.id;
      const result = await controller.findVotes(decisionId);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((v) => v.decisionId === decisionId)).toBe(true);
    });

    it('should throw NotFoundException when decision does not exist', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(controller.findVotes(nonExistentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('create', () => {
    it('should create a new decision', async () => {
      const newDecision: Omit<Decision, 'id'> = {
        title: 'New Decision',
        summary: 'New Summary',
        fullText: 'New Full Text',
        date: new Date(),
        source: 'New Source',
        assemblyId: uuidv4(),
        resultsOverview: {
          inFavor: 200,
          against: 100,
          abstention: 20,
          absent: 10,
          totalVoters: 330,
          isPassed: true,
        },
      };

      const result = await controller.create(newDecision);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(newDecision.title);

      // Verify it's in the repository
      const saved = await repository.findById(result.id);
      expect(saved).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an existing decision', async () => {
      const existingDecisionId = mockDecisions.passingDecision.id;
      const updates = {
        title: 'Updated Title',
        summary: 'Updated Summary',
      };

      const result = await controller.update(existingDecisionId, updates);

      expect(result).toBeDefined();
      expect(result.id).toBe(existingDecisionId);
      expect(result.title).toBe(updates.title);
      expect(result.summary).toBe(updates.summary);

      // Verify it's updated in the repository
      const updated = await repository.findById(existingDecisionId);
      expect(updated?.title).toBe(updates.title);
    });

    it('should throw NotFoundException when trying to update non-existent decision', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;
      const updates = { title: 'Updated Title' };

      await expect(controller.update(nonExistentId, updates)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should delete an existing decision', async () => {
      const existingDecisionId = mockDecisions.passingDecision.id;

      // Verify it exists
      const existingDecision = await repository.findById(existingDecisionId);
      expect(existingDecision).toBeDefined();

      await controller.remove(existingDecisionId);

      // Verify it's deleted
      const deleted = await repository.findById(existingDecisionId);
      expect(deleted).toBeNull();
    });

    it('should throw NotFoundException when trying to delete non-existent decision', async () => {
      const nonExistentId = 'non-existent-id' as DecisionId;

      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
