import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { BullModule } from 'nest-bull';

@Module({
  imports: [
    // TODO is there a way to share this with app.module?
    BullModule.register({
      name: 'store',
      options: {
        redis: {
          port: 6379
        }
      }
    })
  ],
  providers: [EventsGateway]
})
export class EventsModule {}
