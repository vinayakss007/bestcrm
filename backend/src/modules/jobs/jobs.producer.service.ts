
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobsProducerService {
  constructor(@InjectQueue('export') private exportQueue: Queue) {}

  async addAccountExportJob(data: { organizationId: number }) {
    const job = await this.exportQueue.add('account-export', data);
    return job;
  }

  async getJob(jobId: string) {
    return this.exportQueue.getJob(jobId);
  }
}
