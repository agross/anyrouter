import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { DoneCallback, Job, Queue } from 'bull';
import { InjectQueue } from 'nest-bull';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue('ping') readonly queue: Queue
  ) {}

  @Get()
  async getHello(): Promise<string> {
    const job: Job = await this.queue.add('ping', {
      repeat: { cron: '*/1 * * * *' }
    });
    return job.id.toString();
  }

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return await this.queue.getJob(id);
  }
}
