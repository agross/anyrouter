import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as network from 'network';

export default function(job: Job, cb: DoneCallback) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.log(`${job.data.description} ${job.id}`);

  return network.get_gateway_ip(cb);
}
