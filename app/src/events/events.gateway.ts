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

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(@InjectQueue('store') readonly queue: Queue) {}

  afterInit(server: any) {
    // Job scheduled.
    this.queue.on(
      BullQueueGlobalEvents.ACTIVE,
      async (id, _result, _status) => {
        const job = await this.queue.getJob(id);
        this.onEvent({
          type: job.name,
          data: job.data,
          timestamp: new Date(),
          result: 'running'
        });
      }
    );

    // Job failed.
    this.queue.on(
      BullQueueGlobalEvents.FAILED,
      async (id, _result, _status) => {
        const job = await this.queue.getJob(id);
        this.onEvent({
          type: job.name,
          data: job.data,
          timestamp: job.finishedOn,
          result: job.stacktrace
        });

        await job.remove();
      }
    );

    // Job completed successfully.
    this.queue.on(
      BullQueueGlobalEvents.COMPLETED,
      async (id, _result, _status) => {
        const job = await this.queue.getJob(id);
        this.onEvent({
          type: job.name,
          data: job.data,
          timestamp: job.finishedOn,
          result: job.returnvalue
        });

        await job.remove();
      }
    );
  }

  @SubscribeMessage('setDefaultGateway')
  async setDefaultGateway(
    @MessageBody() message: SetDefaultGateway
  ): Promise<JobId> {
    console.log('Changing gateway to ' + message.gateway);

    const job = await this.queue.add('set-default-gateway', {
      gateway: message.gateway
    });

    this.onEvent({
      type: job.name,
      data: job.data,
      timestamp: new Date(),
      result: null
    });
    return job.id;
  }

  @SubscribeMessage('events')
  onEvent(data: any) {
    this.server.emit('events', data);
  }
}
