import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Socket } from 'socket.io';
import { Queue, JobId } from 'bull';
import { BullQueueGlobalEvents } from 'nest-bull';
import { Logger } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { ConfigService } from '../config/config.service';
import { Event } from './models/event';
import { SetDefaultGateway } from './models/set-default-gateway';
import flatMap from 'array.prototype.flatmap';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly QUEUE_MAX_HISTORY = 100;
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jobs: JobsService,
  ) {}

  afterInit() {
    this.jobs.queues.forEach(queue => {
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

  async handleConnection(client: Socket) {
    client.emit('gateways', this.config.gateways);
    client.emit('eventHistory', await this.getEventHistory());
  }

  @SubscribeMessage('setDefaultGateway')
  async setNewDefaultGateway(
    @MessageBody() message: SetDefaultGateway,
  ): Promise<JobId> {
    this.logger.log(`Setting ${message.gateway} as default gateway`);

    const job = await this.jobs.setDefaultGateway.add('set-default-gateway', {
      gateway: message.gateway,
    });

    return job.id;
  }

  @SubscribeMessage('speedTest')
  async speedTest(): Promise<JobId> {
    this.logger.log(`Running Speedtest`);

    const job = await this.jobs.speedTest.add('speed-test', {});

    return job.id;
  }

  @SubscribeMessage('events')
  onEvent(data: Event) {
    this.server.emit('events', data);
  }

  private async getEventHistory(): Promise<Event[]> {
    const getLatestJobs = async (queue: Queue<any>, limit: number) => {
      const jobs = await queue.getJobs(
        ['completed', 'failed', 'delayed'],
        undefined,
        undefined,
        true,
      );

      const events: Event[] = await Promise.all(
        jobs.map(async job => Event.fromJob(job)),
      );

      return events
        .sort((left, right) => left.timestamp - right.timestamp)
        .splice(-limit);
    };

    const result = flatMap(
      await Promise.all(
        this.jobs.queues.map(
          async queue => await getLatestJobs(queue, this.QUEUE_MAX_HISTORY),
        ),
      ),
      x => x,
    );

    this.logger.debug(
      `Loaded ${result.length} completed and failed events from history`,
    );

    return result;
  }
}
