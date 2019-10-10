import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, JobOptions } from 'bull';
import { InjectQueue } from 'nest-bull';
import { env } from 'process';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(@InjectQueue('store') readonly queue: Queue) {}

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
    console.log(jobs);
    console.log(`${allJobs.length} jobs ready`);
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
    return ((env['PING'] || '') + ',' + (env['GATEWAYS'] || ''))
      .split(',')
      .filter(host => host.length > 0)
      .map((host, index) => [
        'ping',
        { description: `Ping ${host}`, host: host },
        { repeat: { every: 5000 + index } }
      ]);
  }

  private schedule(jobs: [string, any, JobOptions][]) {
    const scheduled = jobs.map(async job => {
      const added = await this.queue.add(...(job as [string, any, JobOptions]));
      console.log(`Scheduled job ${JSON.stringify(job)} with ID ${added.id}`);
    });

    return Promise.all(scheduled);
  }
}
