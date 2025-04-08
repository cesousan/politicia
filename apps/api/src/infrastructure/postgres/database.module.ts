import { Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'

import { DatabaseProvider, DATABASE_PROVIDER } from './database.provider'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_PROVIDER,
      useFactory: (configService: ConfigService) => new DatabaseProvider(configService),
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}
