import { OnModuleInit, Logger } from '@nestjs/common';
import { Queue, JobOptions, JobStatusClean } from 'bull';
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
    @InjectQueue('store') private readonly queue: Queue
  ) {}

  async onModuleInit() {
    const jobs = this.getPingJobs().concat([
      [
        'get-default-gateway',
        { description: 'Default Gateway' },
        {
          repeat: { every: 10000 }
        }
      ],
      [
        'public-ip',
        { description: 'Public IP' },
        {
          repeat: { every: 60000 }
        }
      ],
      [
        'speed-test',
        { description: 'Speedtest' },
        {
          repeat: { every: 60000 }
        }
      ]
    ]);

    await this.schedule(jobs);

    const allJobs = await this.queue.getJobs([]);
    this.logger.log(
      `${JSON.stringify(jobs, null, 2)}\n${allJobs.length} jobs ready`
    );

    this.scheduleCleanup(this.queue, this.KEEP_JOB_HISTORY);
  }

  private getPingJobs(): [string, any, JobOptions][] {
    // https://optimalbits.github.io/bull/#repeatable
    // "Bull is smart enough not to add the same repeatable job if the repeat
    // options are the same."
    // Same-named jobs need to have different repeat options.
    return this.config.pingHosts
      .concat(this.config.gateways)
      .map((host, index) => [
        'ping',
        { description: `Ping ${host.description}`, host: host.host },
        {
          repeat: { every: 5000 + index }
        } as JobOptions
      ]);
  }

  private schedule(jobs: [string, any, JobOptions][]) {
    const scheduled = jobs.map(async job => {
      const added = await this.queue.add(...(job as [string, any, JobOptions]));
      this.logger.log(
        `Scheduled job ${JSON.stringify(job)} with ID ${added.id}`
      );
    });

    return Promise.all(scheduled);
  }

  private scheduleCleanup(queue: Queue<any>, keep: TimeSpan) {
    queue.on('cleaned', (jobs, type) =>
      this.logger.debug(`${jobs.length} ${type} jobs cleaned`)
    );

    const every = TimeSpan.fromMinutes(1);

    this.logger.debug(
      `Scheduling cleanup every ${every.totalMinutes()}min for jobs older than ${keep.totalMinutes()}min`
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
