import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';
import Bull = require('bull');

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectQueue('store') readonly queue: Queue) {}

  async onModuleInit() {
    this.queue.clean(0, 'delayed');
    this.queue.clean(0, 'wait');
    this.queue.clean(0, 'active');
    this.queue.clean(0, 'completed');
    this.queue.clean(0, 'failed');

    // https://optimalbits.github.io/bull/#repeatable
    // "Bull is smart enough not to add the same repeatable job if the repeat
    // options are the same."
    // Same-named jobs need to have different repeat options.
    const jobs = [
      ['ping', 'google.de', { repeat: { every: 5000 } }],
      ['ping', 'google.com', { repeat: { every: 5001 } }],
      ['default-gateway', null, { repeat: { every: 10000 } }],
      ['public-ip', null, { repeat: { every: 60000 } }]
    ];

    const scheduled = jobs.map(async job => {
      const added = await this.queue.add(
        ...(job as [string, string, Bull.JobOptions])
      );
      console.log(
        'Scheduled job ' + JSON.stringify(job) + ' with ID ' + added.id
      );
    });

    await Promise.all(scheduled);

    const allJobs = await this.queue.getJobs([]);
    console.log(jobs);
    console.log('Ready with ' + allJobs.length + ' jobs');
  }
}
