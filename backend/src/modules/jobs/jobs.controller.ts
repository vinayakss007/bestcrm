
import { Controller, Get, Param, UseGuards, NotFoundException, StreamableFile } from '@nestjs/common';
import { JobsProducerService } from './jobs.producer.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { AuthenticatedUser } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsProducerService) {}

  @Get(':jobId')
  async getJobStatus(@Param('jobId') jobId: string, @GetUser() user: AuthenticatedUser) {
    const job = await this.jobsService.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    // Basic security check: ensure the job's data matches the user's org
    if (job.data.organizationId !== user.organizationId) {
        throw new NotFoundException('Job not found.');
    }
    
    const isCompleted = await job.isCompleted();
    const isFailed = await job.isFailed();

    if (isCompleted) {
        // If the job is complete, return the CSV data
        const csvData = await job.returnValue;
        return { status: 'completed', data: csvData };
    }
    
    if (isFailed) {
        return { status: 'failed', reason: job.failedReason };
    }

    return { status: 'processing' };
  }
}
