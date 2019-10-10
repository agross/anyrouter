import { Job, DoneCallback } from 'bull';
import * as network from 'network';

export default function(job: Job, cb: DoneCallback) {
  console.log('Getting public IP ' + job.id);
  return network.get_public_ip(cb);
}
