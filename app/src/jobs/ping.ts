import { Job } from 'bull';
import * as isReachable from 'is-reachable';

export default function(job: Job) {
  console.log('Checking ' + job.data + ' ' + job.id);
  return isReachable(job.data);
}
