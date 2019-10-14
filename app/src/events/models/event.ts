import { Job } from "bull";

export enum EventStatus {
  Successful = 'successful',
  Failed = 'failed',
  Running = 'running'
}

export class EventError {
  reason: string;
  stacktrace: string[];

  constructor(job: Job){
    this.stacktrace = job.stacktrace.reduce(
      (acc, line) => acc.concat(line.split('\n')),
      []
      );
    this.reason = this.stacktrace[0];
  }
}

export interface Event {
  type: string;
  status: EventStatus;
  data: any;
  timestamp: number | Date;
  result?: any;
  error?: EventError;
}
