
import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AssignmentRulesModule } from '../assignment-rules/assignment-rules.module';

@Module({
  imports: [DrizzleModule, AssignmentRulesModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
