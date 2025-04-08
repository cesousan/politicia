import { Module } from '@nestjs/common';

import { CommonModule } from './common.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { DecisionsModule } from '../modules/decisions/decisions.module';

@Module({
  imports: [InfrastructureModule, CommonModule, DecisionsModule],
})
export class AppModule {}
