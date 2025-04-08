import { Opaque } from '../../../../shared/types/opaque.type';

import { AssemblyId } from './assembly.model';
import { ElectedOfficialId } from './elected-official.model';

export type DecisionId = Opaque<string, 'DecisionId'>;
export type VoteId = Opaque<string, 'VoteId'>;

export const VoteValue = {
  IN_FAVOR: 'IN_FAVOR',
  AGAINST: 'AGAINST',
  ABSTENTION: 'ABSTENTION',
  ABSENT: 'ABSENT',
} as const;

export type VoteValue = (typeof VoteValue)[keyof typeof VoteValue];

export interface VoteResultsOverview {
  inFavor: number;
  against: number;
  abstention: number;
  absent: number;
  totalVoters: number;
  isPassed: boolean;
}

export interface Decision {
  id: DecisionId;
  title: string;
  summary: string;
  fullText: string | null;
  date: Date;
  source: string;
  assemblyId: AssemblyId;
  resultsOverview: VoteResultsOverview;
}

export interface IndividualVote {
  id: VoteId;
  decisionId: DecisionId;
  electedOfficialId: ElectedOfficialId;
  voteValue: VoteValue;
}

export interface DecisionFilters {
  assemblyId?: AssemblyId;
  dateFrom?: Date;
  dateTo?: Date;
  partyId?: string;
  searchTerm?: string;
}
