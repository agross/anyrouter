import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as util from 'util';
import * as path from 'path';
import * as network from 'network';

const get_public_ip = util.promisify(network.get_public_ip);

export default function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`,
  );
  logger.debug(`Job ${job.id}`);

  return get_public_ip()
    .then((ip: string) => {
      const result = { ip };

      logger.debug(`${JSON.stringify(result, null, 2)}`);
      return result;
    })
    .catch((error: Error) => {
      logger.error(error.message);
      throw error;
    });
}
