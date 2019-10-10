import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Queue } from 'bull';
import { InjectQueue, BullQueueEvent } from 'nest-bull';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(@InjectQueue('store') readonly queue: Queue) {}

  afterInit(server: any) {
    this.queue.on('global:completed', async id => {
      console.log(id);
      const job = await this.queue.getJob(id);
      this.onEvent(null, { type: job.name, result: job.returnvalue });
    });
  }

  @SubscribeMessage('events')
  onEvent(client: any, data: any) {
    this.server.emit("events", data);
  }
}
