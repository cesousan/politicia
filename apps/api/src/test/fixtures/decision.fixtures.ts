import { InsertObject } from 'kysely';
import { v4 as uuidv4 } from 'uuid';

import {
  Decision,
  DecisionId,
} from '../../modules/decisions/domain/models/decision.model';
import { ElectedOfficialId } from '../../modules/decisions/domain/models/elected-official.model';
import {
  IndividualVote,
  VoteId,
  VoteValue,
} from '../../modules/decisions/domain/models/vote.model';
import { Database } from '../../infrastructure/postgres/database.types';

// Use actual UUIDs for test data
const ASSEMBLY_ID_1 = uuidv4();
const ASSEMBLY_ID_2 = uuidv4();
const DECISION_ID_1 = uuidv4();
const DECISION_ID_2 = uuidv4();
const DECISION_ID_3 = uuidv4();
const OFFICIAL_ID_1 = uuidv4();
const OFFICIAL_ID_2 = uuidv4();
const OFFICIAL_ID_3 = uuidv4();

export const mockDecisions = {
  passingDecision: {
    id: DECISION_ID_1 as DecisionId,
    title: 'Climate Change Initiative',
    summary:
      'A proposal to reduce carbon emissions by 30% over the next decade',
    fullText:
      'This proposal aims to address climate change by implementing policies to reduce carbon emissions by 30% over the next decade. It includes funding for renewable energy research and development.',
    date: new Date('2023-03-15'),
    source: 'https://example.com/climate-initiative',
    assemblyId: ASSEMBLY_ID_1,
    resultsOverview: {
      inFavor: 250,
      against: 175,
      abstention: 25,
      absent: 10,
      totalVoters: 460,
      isPassed: true,
    },
  },
  failingDecision: {
    id: DECISION_ID_2 as DecisionId,
    title: 'Tax Reform Proposal',
    summary: 'A proposal to restructure the tax system',
    fullText:
      'This proposal aims to restructure the tax system to increase tax revenue by 15% while reducing the burden on lower-income individuals.',
    date: new Date('2023-02-10'),
    source: 'https://example.com/tax-reform',
    assemblyId: ASSEMBLY_ID_1,
    resultsOverview: {
      inFavor: 180,
      against: 245,
      abstention: 15,
      absent: 20,
      totalVoters: 460,
      isPassed: false,
    },
  },
  recentDecision: {
    id: DECISION_ID_3 as DecisionId,
    title: 'Education Budget Increase',
    summary: 'A proposal to increase the education budget by 10%',
    fullText:
      'This proposal seeks to increase the education budget by 10% to fund teacher raises, new technology, and infrastructure improvements.',
    date: new Date('2023-04-05'),
    source: 'https://example.com/education-budget',
    assemblyId: ASSEMBLY_ID_2,
    resultsOverview: {
      inFavor: 300,
      against: 150,
      abstention: 10,
      absent: 0,
      totalVoters: 460,
      isPassed: true,
    },
  },
};

export const mockVotes: IndividualVote[] = [
  {
    id: uuidv4() as VoteId,
    decisionId: DECISION_ID_1 as DecisionId,
    electedOfficialId: OFFICIAL_ID_1 as ElectedOfficialId,
    voteValue: VoteValue.IN_FAVOR,
  },
  {
    id: uuidv4() as VoteId,
    decisionId: DECISION_ID_1 as DecisionId,
    electedOfficialId: OFFICIAL_ID_2 as ElectedOfficialId,
    voteValue: VoteValue.AGAINST,
  },
  {
    id: uuidv4() as VoteId,
    decisionId: DECISION_ID_1 as DecisionId,
    electedOfficialId: OFFICIAL_ID_3 as ElectedOfficialId,
    voteValue: VoteValue.ABSTENTION,
  },
  {
    id: uuidv4() as VoteId,
    decisionId: DECISION_ID_2 as DecisionId,
    electedOfficialId: OFFICIAL_ID_1 as ElectedOfficialId,
    voteValue: VoteValue.AGAINST,
  },
  {
    id: uuidv4() as VoteId,
    decisionId: DECISION_ID_2 as DecisionId,
    electedOfficialId: OFFICIAL_ID_2 as ElectedOfficialId,
    voteValue: VoteValue.AGAINST,
  },
];

// Export assembly data for assembly fixture
export const mockAssemblies = [
  {
    id: ASSEMBLY_ID_1,
    name: 'National Assembly',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: ASSEMBLY_ID_2,
    name: 'Senate',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

/**
 * Returns a copy of the test decisions
 */
export function getTestDecisions(): Decision[] {
  // TODO: create a mapper to database types
  return Object.values(mockDecisions).map((decision) => ({ ...decision }));
}

export function getTestDbDecisions(): InsertObject<Database, 'decision'>[] {
  return Object.values(mockDecisions).map((decision) => ({
    id: decision.id,
    title: decision.title,
    summary: decision.summary,
    full_text: decision.fullText,
    date: decision.date,
    source: decision.source,
    assembly_id: decision.assemblyId,
    in_favor: decision.resultsOverview.inFavor,
    against: decision.resultsOverview.against,
    abstention: decision.resultsOverview.abstention,
    absent: decision.resultsOverview.absent,
    total_voters: decision.resultsOverview.totalVoters,
    is_passed: decision.resultsOverview.isPassed,
    created_at: new Date(),
    updated_at: new Date(),
  }));
}

/**
 * Get test assemblies for fixtures
 */
export function getTestDbAssemblies(): InsertObject<Database, 'assembly'>[] {
  return mockAssemblies;
}

/**
 * Returns a copy of the test votes
 */
export function getTestVotes(): IndividualVote[] {
  return mockVotes.map((vote) => ({ ...vote }));
}

/**
 * Creates a test decision with optional overrides
 */
export function createTestDecision(overrides?: Partial<Decision>): Decision {
  return {
    ...mockDecisions.passingDecision,
    id: uuidv4() as DecisionId,
    ...overrides,
  };
}

/**
 * Creates a test vote with optional overrides
 */
export function createTestVote(
  overrides?: Partial<IndividualVote>
): IndividualVote {
  return {
    id: uuidv4() as VoteId,
    decisionId: mockDecisions.passingDecision.id,
    electedOfficialId: OFFICIAL_ID_1 as ElectedOfficialId,
    voteValue: VoteValue.IN_FAVOR,
    ...overrides,
  };
}
