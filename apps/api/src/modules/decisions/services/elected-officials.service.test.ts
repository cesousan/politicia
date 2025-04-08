import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  createTestElectedOfficial,
  getTestElectedOfficials,
  mockElectedOfficials,
} from '../../../test/fixtures/elected-official.fixtures';
import { InMemoryElectedOfficialsRepository } from '../adapters/in-memory/elected-officials.repository.in-memory';
import { AssemblyId } from '../domain/models/assembly.model';
import {
  ElectedOfficial,
  ElectedOfficialId,
} from '../domain/models/elected-official.model';
import { PoliticalPartyId } from '../domain/models/political-party.model';
import {
  ELECTED_OFFICIALS_REPOSITORY,
  ElectedOfficialsRepository,
} from '../ports/elected-officials-repository.interface';
import {
  ELECTED_OFFICIALS_SERVICE,
  ElectedOfficialsService,
  IElectedOfficialsService,
} from '../services/elected-officials.service';

describe('ElectedOfficialsService', () => {
  let electedOfficialsService: IElectedOfficialsService;
  let electedOfficialsRepository: InMemoryElectedOfficialsRepository;

  beforeEach(async () => {
    // Setup test module with in-memory repository
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ELECTED_OFFICIALS_REPOSITORY,
          useClass: InMemoryElectedOfficialsRepository,
        },
        {
          provide: ELECTED_OFFICIALS_SERVICE,
          useFactory: (repository: ElectedOfficialsRepository) =>
            new ElectedOfficialsService(repository),
          inject: [ELECTED_OFFICIALS_REPOSITORY],
        },
      ],
    }).compile();

    electedOfficialsService = moduleRef.get<IElectedOfficialsService>(
      ELECTED_OFFICIALS_SERVICE
    );
    electedOfficialsRepository = moduleRef.get<ElectedOfficialsRepository>(
      ELECTED_OFFICIALS_REPOSITORY
    ) as InMemoryElectedOfficialsRepository;

    // Initialize repository with test data
    electedOfficialsRepository.reset();
    getTestElectedOfficials().forEach((official: ElectedOfficial) => {
      electedOfficialsRepository.create(official);
    });
  });

  describe('findAll', () => {
    it('should return an array of elected officials', async () => {
      const officials = await electedOfficialsService.findAll();
      expect(officials).toBeInstanceOf(Array);
      expect(officials.length).toBeGreaterThan(0);
    });
  });

  describe('findById', () => {
    it('should return an elected official when it exists', async () => {
      const existingOfficialId = mockElectedOfficials.official1.id;
      const foundOfficial = await electedOfficialsService.findById(
        existingOfficialId
      );

      expect(foundOfficial).toBeDefined();
      expect(foundOfficial.id).toBe(existingOfficialId);
    });

    it('should throw NotFoundException when elected official does not exist', async () => {
      const nonExistentId = 'non-existent-id' as ElectedOfficialId;

      await expect(
        electedOfficialsService.findById(nonExistentId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAssembly', () => {
    it('should return officials belonging to the specified assembly', async () => {
      const assemblyId = 'assembly-1' as AssemblyId;

      // First create some officials with this assembly ID
      const testOfficial = createTestElectedOfficial();
      await electedOfficialsRepository.create({
        ...testOfficial,
        assemblyId,
      });

      const officials = await electedOfficialsService.findByAssembly(
        assemblyId
      );

      expect(officials).toBeInstanceOf(Array);
      expect(officials.length).toBeGreaterThan(0);
      expect(
        officials.every((o: ElectedOfficial) => o.assemblyId === assemblyId)
      ).toBeTruthy();
    });
  });

  describe('findByParty', () => {
    it('should return officials belonging to the specified party', async () => {
      const partyId = 'party-1' as PoliticalPartyId;

      // First create some officials with this party ID
      const testOfficial = createTestElectedOfficial();
      await electedOfficialsRepository.create({
        ...testOfficial,
        partyId,
      });

      const officials = await electedOfficialsService.findByParty(partyId);

      expect(officials).toBeInstanceOf(Array);
      expect(officials.length).toBeGreaterThan(0);
      expect(
        officials.every((o: ElectedOfficial) => o.partyId === partyId)
      ).toBeTruthy();
    });
  });

  describe('create', () => {
    it('should create a new elected official', async () => {
      const newOfficial: Omit<ElectedOfficial, 'id'> = {
        firstName: 'New',
        lastName: 'Official',
        party: 'New Party',
        position: 'Senator',
        region: 'East',
        bio: 'A new elected official for testing',
        contactInfo: {
          email: 'new.official@example.com',
        },
      };

      const createdOfficial = await electedOfficialsService.create(newOfficial);

      expect(createdOfficial).toBeDefined();
      expect(createdOfficial.id).toBeDefined();
      expect(createdOfficial.firstName).toBe(newOfficial.firstName);
      expect(createdOfficial.lastName).toBe(newOfficial.lastName);

      // Verify it was added to the repository
      const foundOfficial = await electedOfficialsService.findById(
        createdOfficial.id
      );
      expect(foundOfficial).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an existing elected official', async () => {
      const existingOfficialId = mockElectedOfficials.official1.id;
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
      };

      const updatedOfficial = await electedOfficialsService.update(
        existingOfficialId,
        updateData
      );

      expect(updatedOfficial).toBeDefined();
      expect(updatedOfficial.id).toBe(existingOfficialId);
      expect(updatedOfficial.firstName).toBe(updateData.firstName);
      expect(updatedOfficial.lastName).toBe(updateData.lastName);
      expect(updatedOfficial.bio).toBe(updateData.bio);

      // Other properties should remain unchanged
      const originalOfficial = mockElectedOfficials.official1;
      expect(updatedOfficial.party).toBe(originalOfficial.party);
    });

    it('should throw NotFoundException when elected official does not exist', async () => {
      const nonExistentId = 'non-existent-id' as ElectedOfficialId;

      await expect(
        electedOfficialsService.update(nonExistentId, { firstName: 'Updated' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing elected official', async () => {
      const existingOfficialId = mockElectedOfficials.official1.id;

      // Verify it exists before deletion
      const officialBeforeDeletion = await electedOfficialsService.findById(
        existingOfficialId
      );
      expect(officialBeforeDeletion).toBeDefined();

      await electedOfficialsService.delete(existingOfficialId);

      // Verify it no longer exists
      await expect(
        electedOfficialsService.findById(existingOfficialId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when elected official does not exist', async () => {
      const nonExistentId = 'non-existent-id' as ElectedOfficialId;

      await expect(
        electedOfficialsService.delete(nonExistentId)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
