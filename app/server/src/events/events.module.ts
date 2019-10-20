import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JobsModule } from '../jobs/jobs.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [JobsModule.register(), ConfigModule],
  providers: [EventsGateway],
})
export class EventsModule {}
