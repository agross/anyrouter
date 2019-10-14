import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Queue, JobOptions } from 'bull';
import { InjectQueue } from 'nest-bull';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('store') private readonly queue: Queue
  ) {}

  async onModuleInit() {
    this.clearAllJobs();

    const jobs = this.getPingJobs().concat([
      [
        'get-default-gateway',
        { description: 'Default Gateway' },
        { repeat: { every: 10000 } }
      ],
      ['public-ip', { description: 'Public IP' }, { repeat: { every: 60000 } }]
    ]);

    await this.schedule(jobs);

    const allJobs = await this.queue.getJobs([]);
    this.logger.log(
      `${JSON.stringify(jobs, null, 2)}\n${allJobs.length} jobs ready`
    );
  }

  private clearAllJobs() {
    this.queue.clean(0, 'delayed');
    this.queue.clean(0, 'wait');
    this.queue.clean(0, 'active');
    this.queue.clean(0, 'completed');
    this.queue.clean(0, 'failed');
  }

  private getPingJobs(): [string, any, JobOptions][] {
    // https://optimalbits.github.io/bull/#repeatable
    // "Bull is smart enough not to add the same repeatable job if the repeat
    // options are the same."
    // Same-named jobs need to have different repeat options.
    return this.config.pingHosts
      .concat(this.config.gateways)
      .map((host, index) => [
        'ping',
        { description: `Ping ${host.description}`, host: host.host },
        { repeat: { every: 5000 + index } }
      ]);
  }

  private schedule(jobs: [string, any, JobOptions][]) {
    const scheduled = jobs.map(async job => {
      const added = await this.queue.add(...(job as [string, any, JobOptions]));
      this.logger.log(
        `Scheduled job ${JSON.stringify(job)} with ID ${added.id}`
      );
    });

    return Promise.all(scheduled);
  }
}
