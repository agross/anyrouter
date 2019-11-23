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
  async setDefaultGateway(
    @MessageBody() message: SetDefaultGateway,
  ): Promise<JobId> {
    this.logger.log(`Setting ${message.gateway} as default gateway`);

    const job = await this.jobs.setDefaultGateway.add('set-default-gateway', {
      id: message.gateway,
      limit: 5,
      gateway: message.gateway,
    });

    return job.id;
  }

  @SubscribeMessage('speedTest')
  async speedTest(): Promise<JobId> {
    this.logger.log(`Running Speedtest`);

    const job = await this.jobs.speedTest.add('speed-test', { limit: 40 });

    return job.id;
  }

  @SubscribeMessage('events')
  onEvent(data: Event) {
    this.server.emit('events', data);
  }

  private async getEventHistory(): Promise<Event[]> {
    const getLatestJobs = async (queue: Queue<any>) => {
      // Delayed means the job is about to be run.
      const jobs = await queue.getJobs(
        ['completed', 'failed', 'delayed'],
        undefined,
        undefined,
        true,
      );

      const events: Event[] = await Promise.all(
        jobs.map(async job => Event.fromJob(job)),
      );

      const byId: { [key: string]: Event[] } = events.reduce(
        (acc: {}, event: Event) => {
          acc[event.data.id] = acc[event.data.id] || [];
          acc[event.data.id].push(event);
          return acc;
        },
        {},
      );

      const limited = Object.keys(byId).map(group => {
        let sorted = byId[group].sort(
          (left, right) => left.timestamp - right.timestamp,
        );

        if (sorted.length > 0 && sorted[0].data.limit) {
          const limit = events[0].data.limit;
          sorted = sorted.slice(-limit);
        }

        return sorted;
      });

      return flatMap(limited, x => x);
    };

    const result = flatMap(
      await Promise.all(
        this.jobs.queues.map(async queue => {
          const jobs = await getLatestJobs(queue);

          this.logger.debug(
            `${queue.name}: Loaded ${jobs.length} completed, failed and delayed events from history`,
          );

          return jobs;
        }),
      ),
      x => x,
    );

    return result;
  }
}
