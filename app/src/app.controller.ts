import { Controller, Get, Param } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';

@Controller()
export class AppController {
  constructor(@InjectQueue('store') readonly queue: Queue) {}

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return await this.queue.getJob(id);
  }
}
