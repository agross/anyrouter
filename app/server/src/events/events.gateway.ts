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
import { Event } from './models/event';
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

  afterInit(_server: any) {
    this.queue.on(BullQueueGlobalEvents.ACTIVE, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent(await Event.fromJob(job));
    });

    this.queue.on(BullQueueGlobalEvents.FAILED, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent(await Event.fromJob(job));
    });

    this.queue.on(BullQueueGlobalEvents.COMPLETED, async id => {
      const job = await this.queue.getJob(id);
      this.onEvent(await Event.fromJob(job));
    });

    this.queue.on(BullQueueGlobalEvents.STALLED, async id => {
      this.logger.error(`Job ${id} stalled`);
      const job = await this.queue.getJob(id);
      this.onEvent(await Event.fromJob(job));
    });
  }

  async handleConnection(client: Socket, ..._args: any[]) {
    this.logger.log(`New client connected ${client.client.id}`);
    client.emit('gateways', this.config.gateways);
    client.emit('eventHistory', await this.getEventHistory());
  }

  @SubscribeMessage('setDefaultGateway')
  async setDefaultGateway(
    @MessageBody() message: SetDefaultGateway
  ): Promise<JobId> {
    this.logger.log(`Setting ${message.gateway} as default gateway`);

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

  private async getEventHistory(): Promise<Event[]> {
    const jobs = (await this.queue.getJobs(['completed', 'failed' ], undefined, undefined, true))
      .map(async job => await Event.fromJob(job));


      this.logger.log(`${jobs.length} completed and failed events from history`);
      return Promise.all(jobs).then(events => events.sort((left, right) => left.timestamp - right.timestamp));
  }
}
