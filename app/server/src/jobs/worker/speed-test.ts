import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { testSpeed } from 'speedtest-promise';

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.debug(`${job.data.description} job ${job.id}`);

  const results = await testSpeed({ maxTime: 5000, maxServers: 1 });
  console.log(results);
  return results;
}
