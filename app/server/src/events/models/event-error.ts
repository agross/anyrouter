import { Job } from 'bull';

export class EventError {
  reason: string;
  stacktrace: string[];

  constructor(job: Job) {
    this.stacktrace = job.stacktrace.reduce(
      (acc, line) => acc.concat(line.split('\n')),
      [],
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
