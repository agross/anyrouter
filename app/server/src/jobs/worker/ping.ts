import { Job } from 'bull';
import { LoggerFactory } from '../logger-factory';
import * as ping from 'ping';

const logger = LoggerFactory.createLogger(__filename);

export default async function(job: Job) {
  logger.debug(`${job.data.host} job ${job.id}`);

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
    logger.error(`${job.data.host} ${error.message}`);
    throw error;
  }
}
