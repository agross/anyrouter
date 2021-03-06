import { OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, Job, JobOptions, JobStatusClean } from 'bull';
import { InjectQueue, BullQueueEvents } from '@nestjs/bull';
import { Subscription, interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import TimeSpan from 'timespan';
import flatMap from 'array.prototype.flatmap';
import { ConfigService } from '../config/config.service';

export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private subscription: Subscription;

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('ping') private readonly ping: Queue,
    @InjectQueue('get-default-gateway')
    private readonly getDefaultGateway: Queue,
    @InjectQueue('set-default-gateway')
    readonly setDefaultGateway: Queue,
    @InjectQueue('speed-test') readonly speedTest: Queue,
    @InjectQueue('public-ip') private readonly publicIp: Queue,
    @InjectQueue('fritzbox') private readonly fritzbox: Queue,
  ) {}

  async onModuleInit() {
    await this.removeWaitingJobsFromPreviousRuns();
    await this.scheduleRepeatedJobs();

    const subscriptions = this.queues.map(queue =>
      this.scheduleCleanup(queue, this.config.keepJobHistory),
    );

    this.subscription = subscriptions.reduce(
      (acc, el) => acc.add(el),
      new Subscription(),
    );
  }

  onModuleDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public get queues(): Queue<any>[] {
    return [
      this.ping,
      this.getDefaultGateway,
      this.setDefaultGateway,
      this.speedTest,
      this.publicIp,
      this.fritzbox,
    ];
  }

  private async removeWaitingJobsFromPreviousRuns() {
    const types: JobStatusClean[] = ['active', 'delayed', 'wait'];
    const clean = (queue: Queue<any>) => {
      return types.map(status => queue.clean(0, status));
    };

    const oldJobs = this.queues.map(queue => clean(queue));
    this.logger.log(`${oldJobs.length} old jobs deleted`);
    await Promise.all(flatMap(oldJobs, x => x));
  }

  private async scheduleRepeatedJobs() {
    const jobs = this.getPingJobs(this.ping)
      .concat(this.getFritzboxJobs(this.fritzbox))
      .concat([
        [
          this.getDefaultGateway,
          {
            limit: 5,
          },
          {
            repeat: { every: 10000 },
          },
        ],
        [
          this.publicIp,
          {
            limit: 5,
          },
          {
            repeat: { every: 60000 },
          },
        ],
      ]);

    const scheduled = jobs.map(job => {
      const [queue, data, options, ..._rest] = job;

      return this.schedule(queue, data, options);
    });

    await Promise.all(scheduled);
  }

  private getPingJobs(queue: Queue<any>): [Queue<any>, any, JobOptions][] {
    // https://optimalbits.github.io/bull/#repeatable
    // "Bull is smart enough not to add the same repeatable job if the repeat
    // options are the same."
    // Same-named jobs need to have different repeat options.
    return this.config.pingHosts
      .concat(this.config.gateways)
      .map((host, index) => [
        queue,
        {
          limit: 40,
          id: host.host,
          description: host.description,
          host: host.host,
        },
        {
          repeat: { every: 5000 + index },
        } as JobOptions,
      ]);
  }

  private getFritzboxJobs(queue: Queue<any>): [Queue<any>, any, JobOptions][] {
    // https://optimalbits.github.io/bull/#repeatable
    // "Bull is smart enough not to add the same repeatable job if the repeat
    // options are the same."
    // Same-named jobs need to have different repeat options.
    return this.config.fritzboxHosts.map((host, index) => [
      queue,
      {
        limit: 40,
        id: host.host,
        description: host.description,
        host: host.host,
      },
      {
        repeat: { every: 2000 + index },
      } as JobOptions,
    ]);
  }

  private async schedule(
    queue: Queue<any>,
    data: any,
    job: JobOptions,
  ): Promise<Job<any>> {
    return queue.add(queue.name, data, job).then(added => {
      this.logger.log(
        `Scheduled job ${JSON.stringify(added)} with ID ${added.id} on ${
          queue.name
        }`,
      );
      return added;
    });
  }

  private scheduleCleanup(queue: Queue<any>, keep: TimeSpan): Subscription {
    queue.on(BullQueueEvents.CLEANED, (jobs, type) =>
      this.logger.debug(`${queue.name}: ${jobs.length} ${type} jobs cleaned`),
    );

    const every = TimeSpan.fromMinutes(1);

    this.logger.debug(
      `${
        queue.name
      }: Scheduling cleanup every ${every.totalMinutes()}min for jobs older than ${keep.totalMinutes()}min`,
    );

    return interval(every.totalMilliseconds())
      .pipe(
        tap(_ => this.logger.debug(`${queue.name}: Cleaning...`)),
        tap(_ => {
          const types: JobStatusClean[] = ['completed', 'failed'];
          const clean = types.map(status =>
            queue.clean(keep.totalMilliseconds(), status),
          );

          return Promise.all(clean);
        }),
      )
      .subscribe();
  }
}
