import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as network from 'network';

export default function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`,
  );
  logger.debug(`Job ${job.id}`);

  return new Promise((resolve, reject) => {
    network.get_gateway_ip((error: Error, ip: string) => {
      if (error) {
        logger.error(error.message);
        reject(error);
      } else {
        const result = { ip };

        logger.debug(`${JSON.stringify(result, null, 2)}`);
        resolve(result);
      }
    });
  });
}
