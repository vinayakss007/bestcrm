
import { Module } from '@nestjs/common';
import { AssignmentRulesService } from './assignment-rules.service';
import { AssignmentRulesController } from './assignment-rules.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [AssignmentRulesController],
  providers: [AssignmentRulesService],
  exports: [AssignmentRulesService],
})
export class AssignmentRulesModule {}
