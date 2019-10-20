import { OnModuleInit, Logger } from '@nestjs/common';
import { Queue, Job, JobOptions, JobStatusClean } from 'bull';
import { InjectQueue } from 'nest-bull';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import TimeSpan from 'timespan';
import { ConfigService } from '../config/config.service';

export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);
  private readonly KEEP_JOB_HISTORY: TimeSpan = TimeSpan.fromHours(1);

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

  async onModuleInit() {
    const jobs = this.getPingJobs(this.ping).concat([
      [
        this.getDefaultGateway,
        { description: 'Default Gateway' },
        {
          repeat: { every: 10000 }
        }
      ],
      [
        this.publicIp,
        { description: 'Public IP' },
        {
          repeat: { every: 60000 }
        }
      ],
      [
        this.speedTest,
        { description: 'Speedtest' },
        {
          repeat: { every: 60000 }
        }
      ]
    ]);

    const scheduled = jobs.map(job => {
      const [queue, data, options, ..._rest] = job;

      return this.schedule(queue, data, options);
    });

    await Promise.all(scheduled);

    this.queues.map(q => this.scheduleCleanup(q, this.KEEP_JOB_HISTORY));
  }

  private get queues(): Queue<any>[] {
    return [
      this.ping,
      this.getDefaultGateway,
      this.setDefaultGateway,
      this.speedTest,
      this.publicIp
    ];
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
        { description: `Ping ${host.description}`, host: host.host },
        {
          repeat: { every: 5000 + index }
        } as JobOptions
      ]);
  }

  private async schedule(
    queue: Queue<any>,
    data: any,
    job: JobOptions
  ): Promise<Job<any>> {
    return queue.add(queue.name, data, job).then(added => {
      this.logger.log(
        `Scheduled job ${JSON.stringify(added)} with ID ${added.id} on ${
          queue.name
        }`
      );
      return added;
    });
  }

  private scheduleCleanup(queue: Queue<any>, keep: TimeSpan) {
    queue.on('cleaned', (jobs, type) =>
      this.logger.debug(`${queue.name}: ${jobs.length} ${type} jobs cleaned`)
    );

    const every = TimeSpan.fromMinutes(1);

    this.logger.debug(
      `${
        queue.name
      }: Scheduling cleanup every ${every.totalMinutes()}min for jobs older than ${keep.totalMinutes()}min`
    );

    timer(every.totalMilliseconds())
      .pipe(
        tap(_ => {
          const types: JobStatusClean[] = ['completed', 'failed'];
          const clean = types.map(status =>
            queue.clean(keep.totalMilliseconds(), status)
          );

          return Promise.all(clean);
        })
      )
      .subscribe();
  }
}
