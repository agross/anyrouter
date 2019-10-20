import { Job } from 'bull';

export enum EventStatus {
  Successful = 'successful',
  Failed = 'failed',
  Running = 'running'
}

export class EventError {
  reason: string;
  stacktrace: string[];

  constructor(job: Job) {
    this.stacktrace = job.stacktrace.reduce(
      (acc, line) => acc.concat(line.split('\n')),
      []
    );

    if (this.stacktrace.length) {
      this.reason = this.stacktrace[0];
    }

    if (!this.reason) {
      // Stalled jobs have a failedReason that we cannot access directly.
      const json = job.toJSON();
      this.reason = json.failedReason;
    }
  }
}

export class Event {
  id: string;
  type: string;
  status: EventStatus;
  data: any;
  timestamp: number;
  result?: any;
  error?: EventError;

  public static async fromJob(job: Job): Promise<Event> {
    const event = new Event();
    event.id = job.id.toString();
    event.type = job.name;
    event.data = job.data;

    if (await job.isActive()) {
      event.status = EventStatus.Running;
      event.timestamp = job.processedOn;
    }

    if (await job.isFailed()) {
      event.status = EventStatus.Failed;
      event.timestamp = job.finishedOn;
      event.error = new EventError(job);
    }

    if (await job.isCompleted()) {
      event.status = EventStatus.Successful;
      event.timestamp = job.finishedOn;
      event.result = job.returnvalue;

      if (!event.result) {
        console.error(`${event.id} success without result`);
      }
    }

    return event;
  }
}
