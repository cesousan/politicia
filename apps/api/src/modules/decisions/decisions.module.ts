import { Module } from '@nestjs/common'
import { PostgresRepositoriesModule } from './adapters/postgres/postgres-decisions.module'
import { DecisionsController } from './controllers/decisions.controller'
import { DECISIONS_REPOSITORY } from './ports/decisions-repository.interface'
import { DecisionsRepository } from './ports/decisions-repository.interface'
import { DECISIONS_SERVICE, DecisionsService } from './services/decisions.service'

@Module({
  imports: [PostgresRepositoriesModule],
  controllers: [DecisionsController],
  providers: [
    {
      provide: DECISIONS_SERVICE,
      useFactory: (repository: DecisionsRepository) => new DecisionsService(repository),
      inject: [DECISIONS_REPOSITORY],
    },
  ],
})
export class DecisionsModule {}
