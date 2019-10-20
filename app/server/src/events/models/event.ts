import { Job } from 'bull';
import { EventStatus } from './event-status';
import { EventError } from './event-error';

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
