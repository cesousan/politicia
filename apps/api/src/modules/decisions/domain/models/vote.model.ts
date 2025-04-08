import { Opaque } from '../../../../shared/types/opaque.type';

import { DecisionId } from './decision.model';
import { ElectedOfficialId } from './elected-official.model';

export type VoteId = Opaque<string, 'VoteId'>;

export enum VoteValue {
  IN_FAVOR = 'IN_FAVOR',
  AGAINST = 'AGAINST',
  ABSTENTION = 'ABSTENTION',
  ABSENT = 'ABSENT',
}

export interface IndividualVote {
  id: VoteId;
  decisionId: DecisionId;
  electedOfficialId: ElectedOfficialId;
  voteValue: VoteValue;
}
