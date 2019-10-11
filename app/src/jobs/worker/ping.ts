import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as isReachable from 'is-reachable';

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.log(`${job.data.description} ${job.id}`);

  const reachable = await isReachable(job.data.host);
  if (reachable) {
    return;
  } else {
    throw new Error(`${job.data.host} is not reachable`);
  }
}
