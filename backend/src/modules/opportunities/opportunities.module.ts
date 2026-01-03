
import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AssignmentRulesModule } from '../assignment-rules/assignment-rules.module';

@Module({
  imports: [DrizzleModule, AssignmentRulesModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}
