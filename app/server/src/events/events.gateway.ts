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
import flatMap from 'array.prototype.flatmap';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('ping') private readonly ping: Queue,
    @InjectQueue('get-default-gateway')
    private readonly getDefaultGateway: Queue,
    @InjectQueue('set-default-gateway')
    private readonly setDefaultGateway: Queue,
    @InjectQueue('speed-test') private readonly speedTest: Queue,
    @InjectQueue('public-ip') private readonly publicIp: Queue
  ) {}

  private get queues(): Queue<any>[] {
    return [
      this.ping,
      this.getDefaultGateway,
      this.setDefaultGateway,
      this.speedTest,
      this.publicIp
    ];
  }

  afterInit(_server: any) {
    this.queues.forEach(queue => {
      queue.on(BullQueueGlobalEvents.ACTIVE, async id => {
        const job = await queue.getJob(id);
        this.onEvent(await Event.fromJob(job));
      });

      queue.on(BullQueueGlobalEvents.FAILED, async id => {
        const job = await queue.getJob(id);
        this.onEvent(await Event.fromJob(job));
      });

      queue.on(BullQueueGlobalEvents.COMPLETED, async id => {
        const job = await queue.getJob(id);
        this.onEvent(await Event.fromJob(job));
      });

      queue.on(BullQueueGlobalEvents.STALLED, async id => {
        const job = await queue.getJob(id);
        this.logger.error(`Job ${id} stalled (${job.name})`);
        this.onEvent(await Event.fromJob(job));
      });
    });
  }

  async handleConnection(client: Socket, ..._args: any[]) {
    client.emit('gateways', this.config.gateways);
    client.emit('eventHistory', await this.getEventHistory());
  }

  @SubscribeMessage('setDefaultGateway')
  async setNewDefaultGateway(
    @MessageBody() message: SetDefaultGateway
  ): Promise<JobId> {
    this.logger.log(`Setting ${message.gateway} as default gateway`);

    const job = await this.setDefaultGateway.add('set-default-gateway', {
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
    const jobs = await Promise.all(
      this.queues.map(queue => {
        return queue.getJobs(
          ['completed', 'failed'],
          undefined,
          undefined,
          true
        );
      })
    );

    const events = flatMap(jobs, x => x).map(async job => Event.fromJob(job));

    this.logger.debug(
      `Loaded ${events.length} completed and failed events from history`
    );
    return Promise.all(events).then(events =>
      events.sort((left, right) => left.timestamp - right.timestamp)
    );
  }
}
