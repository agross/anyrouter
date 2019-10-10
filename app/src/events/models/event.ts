export enum EventStatus {
  Successful = 'successful',
  Failed = 'failed',
  Running = 'running'
}

export interface Event {
  type: string;
  status: EventStatus;
  data: any;
  timestamp: number | Date;
  result?: any;
  error?: string[];
}
