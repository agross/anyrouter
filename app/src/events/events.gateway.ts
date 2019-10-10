import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  MessageBody
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Queue, JobId } from 'bull';
import { BullQueueGlobalEvents, InjectQueue } from 'nest-bull';
import { SetDefaultGateway } from './models/set-default-gateway';
import { Event, EventStatus } from './models/event';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(@InjectQueue('store') readonly queue: Queue) {}

  afterInit(server: any) {
    this.queue.on(BullQueueGlobalEvents.ACTIVE, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent({
        type: job.name,
        status: EventStatus.Running,
        data: job.data,
        timestamp: job.processedOn
      });
    });

    this.queue.on(BullQueueGlobalEvents.FAILED, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent({
        type: job.name,
        status: EventStatus.Failed,
        data: job.data,
        timestamp: job.finishedOn,
        error: job.stacktrace.reduce(
          (acc, line) => acc.concat(line.split('\n')),
          []
        )
      });

      await job.remove();
    });

    this.queue.on(BullQueueGlobalEvents.COMPLETED, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent({
        type: job.name,
        status: EventStatus.Successful,
        data: job.data,
        timestamp: job.finishedOn,
        result: job.returnvalue,
        error: []
      });

      await job.remove();
    });
  }

  @SubscribeMessage('setDefaultGateway')
  async setDefaultGateway(
    @MessageBody() message: SetDefaultGateway
  ): Promise<JobId> {
    console.log('Changing gateway to ' + message.gateway);

    const job = await this.queue.add('set-default-gateway', {
      description: 'Set default gateway',
      gateway: message.gateway
    });

    return job.id;
  }

  @SubscribeMessage('events')
  onEvent(data: Event) {
    this.server.emit('events', data);
  }
}
