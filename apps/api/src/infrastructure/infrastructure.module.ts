import { Module } from '@nestjs/common'
import { DatabaseModule } from './postgres/database.module'

@Module({
  imports: [DatabaseModule],
  exports: [DatabaseModule],
})
export class InfrastructureModule {}
