import { Job } from 'bull';
import { testSpeed } from 'speedtest-promise';
import { LoggerFactory } from '../logger-factory';

const logger = LoggerFactory.createLogger(__filename);

export default async function(job: Job) {
  logger.debug(`Job ${job.id}`);

  const results = await testSpeed({ maxTime: 5000, maxServers: 1 });
  logger.debug(JSON.stringify(results, null, 2));
  return results;
}
