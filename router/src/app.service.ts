import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';
import { Hash } from 'crypto';
import Bull = require('bull');

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectQueue('store') readonly queue: Queue<string>
  ) {}

  async onModuleInit() {
    const options: Bull.JobOptions = {
      repeat: { every: 5000 }
    };

    const jobs = [
      ['ping', 'google.de'],
      ['default-gateway', ''],
      ['public-ip', '']
    ]

    const scheduled = jobs.map(async job => {
      const args = [...job, options];
      const added = await this.queue.add(...args as [string, string, Bull.JobOptions]);
      console.log('Scheduled job ' + job[0] + ' with ID ' + added.id);
    });

    await Promise.all(scheduled);
    console.log('Ready');
  }
}
