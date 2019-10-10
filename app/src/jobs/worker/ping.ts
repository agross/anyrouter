import { Job } from 'bull';
import * as isReachable from 'is-reachable';

export default async function(job: Job) {
  console.log(`${job.data.description} ${job.id}`);
  const reachable = await isReachable(job.data.host);
  if (reachable) {
    return;
  } else {
    throw new Error(`${job.data.host} is not reachable`);
  }
}
