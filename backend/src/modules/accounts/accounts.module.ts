
import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [DrizzleModule, JobsModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
