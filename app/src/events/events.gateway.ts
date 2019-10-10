import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Queue } from 'bull';
import { InjectQueue, BullQueueGlobalEvents } from 'nest-bull';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(@InjectQueue('store') readonly queue: Queue) {}

  afterInit(server: any) {
    this.queue.on(
      BullQueueGlobalEvents.COMPLETED,
      async (id, result, _status) => {
        const job = await this.queue.getJob(id);
        this.onEvent({ type: job.name, data: job.data, result: result });
        await job.remove();
      }
    );
  }

  @SubscribeMessage('events')
  onEvent(data: any) {
    this.server.emit('events', data);
  }
}
