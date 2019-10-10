import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [EventsModule, JobsModule.register()],
  controllers: [AppController]
})
export class AppModule {}
