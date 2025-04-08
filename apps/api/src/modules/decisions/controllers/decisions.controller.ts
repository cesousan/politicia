import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  Decision,
  type DecisionFilters,
  type DecisionId,
  IndividualVote,
} from '../domain/models/decision.model';
import {
  DECISIONS_SERVICE,
  type IDecisionsService,
} from '../services/decisions.service';

@Controller('decisions')
export class DecisionsController {
  constructor(
    @Inject(DECISIONS_SERVICE)
    private readonly decisionsService: IDecisionsService
  ) {}

  @Get()
  async findAll(@Query() filters: DecisionFilters): Promise<Decision[]> {
    return this.decisionsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: DecisionId): Promise<Decision> {
    return this.decisionsService.findById(id);
  }

  @Get(':id/votes')
  async findVotes(@Param('id') id: DecisionId): Promise<IndividualVote[]> {
    return this.decisionsService.findVotesByDecisionId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() decision: Omit<Decision, 'id'>): Promise<Decision> {
    return this.decisionsService.create(decision);
  }

  @Put(':id')
  async update(
    @Param('id') id: DecisionId,
    @Body() decision: Partial<Decision>
  ): Promise<Decision> {
    return this.decisionsService.update(id, decision);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: DecisionId): Promise<void> {
    await this.decisionsService.delete(id);
  }
}
