import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  MessageBody,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Queue, JobId } from 'bull';
import { BullQueueGlobalEvents, InjectQueue } from 'nest-bull';
import { SetDefaultGateway } from './models/set-default-gateway';
import { Event, EventStatus, EventError } from './models/event';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ConfigService } from '../config/config.service';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('store') readonly queue: Queue
  ) {}

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
        error: new EventError(job)
      });

      // await job.remove();
    });

    this.queue.on(BullQueueGlobalEvents.COMPLETED, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent({
        type: job.name,
        status: EventStatus.Successful,
        data: job.data,
        timestamp: job.finishedOn,
        result: job.returnvalue
      });

      // await job.remove();
    });

    this.queue.on(BullQueueGlobalEvents.STALLED, async id => {
      this.logger.error(`Job ${id} stalled`);

      const job = await this.queue.getJob(id);
      this.onEvent({
        type: job.name,
        status: EventStatus.Failed,
        data: job.data,
        timestamp: new Date(),
        error: new EventError(job)
      });

      // await job.remove();
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`New client connected ${client.client.id}`);
    client.emit('gateways', this.config.gateways);
  }

  @SubscribeMessage('setDefaultGateway')
  async setDefaultGateway(
    @MessageBody() message: SetDefaultGateway
  ): Promise<JobId> {
    this.logger.log(`Setting ${message.gateway} as default gateway`);

    const job = await this.queue.add(
      'set-default-gateway',
      {
        description: 'Set default gateway',
        gateway: message.gateway
      },
      {
        removeOnComplete: 1,
        removeOnFail: 20
      }
    );

    return job.id;
  }

  @SubscribeMessage('events')
  onEvent(data: Event) {
    this.server.emit('events', data);
  }
}
