import { Job } from 'bull';
import { LoggerFactory } from '../logger-factory';
import * as util from 'util';
import * as network from 'network';

const logger = LoggerFactory.createLogger(__filename);

const getGatewayIp = util.promisify(network.get_gateway_ip);

export default function(job: Job) {
  logger.debug(`Job ${job.id}`);

  return getGatewayIp()
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
