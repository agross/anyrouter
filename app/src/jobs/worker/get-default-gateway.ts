import { Job, DoneCallback } from 'bull';
import * as network from 'network';

export default function(job: Job, cb: DoneCallback) {
  console.log(`${job.data.description} ${job.id}`);
  return network.get_gateway_ip(cb);
}
