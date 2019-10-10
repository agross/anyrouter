import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule.register()],
  providers: [EventsGateway]
})
export class EventsModule {}
