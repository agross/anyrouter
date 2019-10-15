import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as util from 'util';
import * as path from 'path';
import * as dns from 'dns';
import * as ping from 'net-ping';

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.debug(`${job.data.description} job ${job.id}`);

  try {
    var ip: dns.LookupAddress = await util.promisify(dns.lookup)(job.data.host);
    logger.debug(`${job.data.host}: IP ${ip.address}`);
  } catch (error) {
    logger.error(`${job.data.host}: IP ${error}`);
    throw error;
  }

  return new Promise((resolve, reject) => {
    const options = {
      retries: 0,
      _debug: false
    };

    const session = ping.createSession(options);
    session.on('error', (error: Error) => {
      logger.error(
        `${job.data.host} (${ip.address}): ${JSON.stringify(error, null, 2)}`
      );
      reject(error);
      session.close();
    });

    session.pingHost(
      ip.address,
      (error: Error, _target: string, sent: number, received: number) => {
        session.close();

        if (error) {
          logger.error(
            `${job.data.host} (${ip.address}) ${JSON.stringify(error, null, 2)}`
          );
          reject(error);
        } else {
          const rtt = received - sent;
          const result = { ip: ip, rtt: rtt };

          logger.debug(`${job.data.host}: ${JSON.stringify(result, null, 2)}`);
          resolve(result);
        }
      }
    );
  });
}
