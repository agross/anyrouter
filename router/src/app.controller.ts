import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue('store') readonly queue: Queue
  ) {}

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return await this.queue.getJob(id);
  }
}
