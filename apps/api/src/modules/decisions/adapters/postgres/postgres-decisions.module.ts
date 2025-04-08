import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../../../../infrastructure/infrastructure.module';
import {
  DATABASE_PROVIDER,
  DatabaseProvider,
} from '../../../../infrastructure/postgres/database.provider';
import { DECISIONS_REPOSITORY } from '../../ports/decisions-repository.interface';
import { SqlDecisionsRepository } from './decisions.repository.postgres';

@Module({
  imports: [InfrastructureModule],
  providers: [
    {
      provide: DECISIONS_REPOSITORY,
      useFactory: (databaseProvider: DatabaseProvider) =>
        new SqlDecisionsRepository(databaseProvider),
      inject: [DATABASE_PROVIDER],
    },
  ],
  exports: [DECISIONS_REPOSITORY],
})
export class PostgresRepositoriesModule {}
