import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [EventsModule, ConfigModule],
  controllers: [AppController]
})
export class AppModule {}
