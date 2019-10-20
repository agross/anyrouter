import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as ping from 'ping';

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`,
  );
  logger.debug(`${job.data.description} job ${job.id}`);

  try {
    const result = await ping.promise.probe(job.data.host, {
      timeout: 2,
      min_reply: 1,
    });

    if (!result.alive) {
      throw Error('No response');
    }

    logger.debug(`${job.data.host} ${JSON.stringify(result, null, 2)}`);

    return {
      ip: result.numeric_host,
      rtt: result.time,
    };
  } catch (error) {
    logger.error(`${job.data.host} ${JSON.stringify(error, null, 2)}`);
    throw error;
  }
}
