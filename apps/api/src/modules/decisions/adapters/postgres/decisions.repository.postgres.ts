import { Inject } from '@nestjs/common';

import { Kysely, sql } from 'kysely';

import {
  DATABASE_PROVIDER,
  DatabaseProvider,
} from '../../../../infrastructure/postgres/database.provider';
import { Database } from '../../../../infrastructure/postgres/database.types';
import {
  Decision,
  DecisionFilters,
  DecisionId,
  IndividualVote,
  VoteId,
  VoteResultsOverview,
  VoteValue,
} from '../../domain/models/decision.model';
import { ElectedOfficialId } from '../../domain/models/elected-official.model';
import { DecisionsRepository } from '../../ports/decisions-repository.interface';

export class SqlDecisionsRepository implements DecisionsRepository {
  private db: Kysely<Database>;

  constructor(
    @Inject(DATABASE_PROVIDER) private databaseProvider: DatabaseProvider
  ) {
    this.db = this.databaseProvider.getDb();
  }

  async findAll(filters?: DecisionFilters): Promise<Decision[]> {
    let query = this.db
      .selectFrom('decision')
      .leftJoin('assembly', 'assembly.id', 'decision.assembly_id')
      .select([
        'decision.id',
        'decision.title',
        'decision.summary',
        'decision.full_text as fullText',
        'decision.date',
        'decision.source',
        'decision.assembly_id as assemblyId',
        'decision.in_favor as inFavor',
        'decision.against',
        'decision.abstention',
        'decision.absent',
        'decision.total_voters as totalVoters',
        'decision.is_passed as isPassed',
      ]);

    // Apply filters if they exist
    if (filters) {
      if (filters.assemblyId) {
        query = query.where('decision.assembly_id', '=', filters.assemblyId);
      }

      if (filters.dateFrom) {
        query = query.where('decision.date', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('decision.date', '<=', filters.dateTo);
      }

      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        query = query.where((eb) =>
          eb.or([
            eb('decision.title', 'ilike', searchTerm),
            eb('decision.summary', 'ilike', searchTerm),
            eb('decision.full_text', 'ilike', searchTerm),
          ])
        );
      }

      // For partyId filter, we would need to join with votes and elected_official tables
      // This is a more complex query that will be added if needed
    }

    const rows = await query.execute();

    return rows.map((row) => ({
      id: row.id as DecisionId,
      title: row.title,
      summary: row.summary,
      fullText: row.fullText,
      date: new Date(row.date),
      source: row.source,
      assemblyId: row.assemblyId,
      resultsOverview: {
        inFavor: Number(row.inFavor),
        against: Number(row.against),
        abstention: Number(row.abstention),
        absent: Number(row.absent),
        totalVoters: Number(row.totalVoters),
        isPassed: row.isPassed,
      } as VoteResultsOverview,
    }));
  }

  async findById(id: DecisionId): Promise<Decision | null> {
    const row = await this.db
      .selectFrom('decision')
      .where('id', '=', id)
      .select([
        'id',
        'title',
        'summary',
        'full_text as fullText',
        'date',
        'source',
        'assembly_id as assemblyId',
        'in_favor as inFavor',
        'against',
        'abstention',
        'absent',
        'total_voters as totalVoters',
        'is_passed as isPassed',
      ])
      .executeTakeFirst();

    if (!row) return null;

    return {
      id: row.id as DecisionId,
      title: row.title,
      summary: row.summary,
      fullText: row.fullText,
      date: new Date(row.date),
      source: row.source,
      assemblyId: row.assemblyId,
      resultsOverview: {
        inFavor: Number(row.inFavor),
        against: Number(row.against),
        abstention: Number(row.abstention),
        absent: Number(row.absent),
        totalVoters: Number(row.totalVoters),
        isPassed: row.isPassed,
      },
    };
  }

  async findVotesByDecisionId(
    decisionId: DecisionId
  ): Promise<IndividualVote[]> {
    const rows = await this.db
      .selectFrom('individual_vote')
      .where('decision_id', '=', decisionId)
      .select([
        'id',
        'decision_id as decisionId',
        'elected_official_id as electedOfficialId',
        'vote_value as voteValue',
      ])
      .execute();

    return rows.map((row) => ({
      id: row.id as VoteId,
      decisionId: row.decisionId as DecisionId,
      electedOfficialId: row.electedOfficialId as ElectedOfficialId,
      voteValue: row.voteValue as VoteValue,
    }));
  }

  async create(decision: Omit<Decision, 'id'>): Promise<Decision> {
    const { resultsOverview, ...decisionData } = decision;

    const result = await this.db
      .insertInto('decision')
      .values({
        title: decisionData.title,
        summary: decisionData.summary,
        full_text: decisionData.fullText,
        date: decisionData.date,
        source: decisionData.source,
        assembly_id: decisionData.assemblyId,
        in_favor: resultsOverview.inFavor,
        against: resultsOverview.against,
        abstention: resultsOverview.abstention,
        absent: resultsOverview.absent,
        total_voters: resultsOverview.totalVoters,
        is_passed: resultsOverview.isPassed,
        created_at: sql`CURRENT_TIMESTAMP`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .returning([
        'id',
        'title',
        'summary',
        'full_text as fullText',
        'date',
        'source',
        'assembly_id as assemblyId',
        'in_favor as inFavor',
        'against',
        'abstention',
        'absent',
        'total_voters as totalVoters',
        'is_passed as isPassed',
      ])
      .executeTakeFirstOrThrow();

    return {
      id: result.id as DecisionId,
      title: result.title,
      summary: result.summary,
      fullText: result.fullText,
      date: new Date(result.date),
      source: result.source,
      assemblyId: result.assemblyId,
      resultsOverview: {
        inFavor: Number(result.inFavor),
        against: Number(result.against),
        abstention: Number(result.abstention),
        absent: Number(result.absent),
        totalVoters: Number(result.totalVoters),
        isPassed: result.isPassed,
      },
    };
  }

  async update(id: DecisionId, decision: Partial<Decision>): Promise<Decision> {
    const updateData: Record<string, any> = {};
    const { resultsOverview, ...decisionData } = decision;

    // Map domain properties to database columns
    if (decisionData.title !== undefined) updateData.title = decisionData.title;
    if (decisionData.summary !== undefined)
      updateData.summary = decisionData.summary;
    if (decisionData.fullText !== undefined)
      updateData.full_text = decisionData.fullText;
    if (decisionData.date !== undefined) updateData.date = decisionData.date;
    if (decisionData.source !== undefined)
      updateData.source = decisionData.source;
    if (decisionData.assemblyId !== undefined)
      updateData.assembly_id = decisionData.assemblyId;

    // Handle results overview properties if they exist
    if (resultsOverview) {
      if (resultsOverview.inFavor !== undefined)
        updateData.in_favor = resultsOverview.inFavor;
      if (resultsOverview.against !== undefined)
        updateData.against = resultsOverview.against;
      if (resultsOverview.abstention !== undefined)
        updateData.abstention = resultsOverview.abstention;
      if (resultsOverview.absent !== undefined)
        updateData.absent = resultsOverview.absent;
      if (resultsOverview.totalVoters !== undefined)
        updateData.total_voters = resultsOverview.totalVoters;
      if (resultsOverview.isPassed !== undefined)
        updateData.is_passed = resultsOverview.isPassed;
    }

    // Add updated_at timestamp
    updateData.updated_at = sql`CURRENT_TIMESTAMP`;

    const result = await this.db
      .updateTable('decision')
      .set(updateData)
      .where('id', '=', id)
      .returning([
        'id',
        'title',
        'summary',
        'full_text as fullText',
        'date',
        'source',
        'assembly_id as assemblyId',
        'in_favor as inFavor',
        'against',
        'abstention',
        'absent',
        'total_voters as totalVoters',
        'is_passed as isPassed',
      ])
      .executeTakeFirstOrThrow();

    return {
      id: result.id as DecisionId,
      title: result.title,
      summary: result.summary,
      fullText: result.fullText,
      date: new Date(result.date),
      source: result.source,
      assemblyId: result.assemblyId,
      resultsOverview: {
        inFavor: Number(result.inFavor),
        against: Number(result.against),
        abstention: Number(result.abstention),
        absent: Number(result.absent),
        totalVoters: Number(result.totalVoters),
        isPassed: result.isPassed,
      },
    };
  }

  async delete(id: DecisionId): Promise<boolean> {
    const result = await this.db
      .deleteFrom('decision')
      .where('id', '=', id)
      .execute();

    return result.length > 0;
  }
}
