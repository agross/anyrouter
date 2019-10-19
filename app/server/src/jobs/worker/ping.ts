import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as util from 'util';
import * as path from 'path';
import * as dns from 'dns';
import * as ping from 'net-ping';

const dnsLookup = util.promisify(dns.lookup);

const options = {
  retries: 0,
  _debug: false
};

const session = ping.createSession(options);
// session.on('error', (error: Error) => {
//   logger.error(
//     `${job.data.host} (${ip.address}): ${JSON.stringify(error, null, 2)}`
//   );
//   session.close();

//   throw error;
// });

session.pingHost[util.promisify.custom] = (ip: string) => {
  return new Promise((resolve, reject) => {
    session.pingHost(
      ip,
      (error: Error, target: string, sent: number, received: number) => {
        if (error) {
          reject(error);
        } else {
          const rtt = received - sent;
          resolve({ ip: target, rtt: rtt });
        }
      }
    );
  });
};

const pingHost = util.promisify(session.pingHost);

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.debug(`${job.data.description} job ${job.id}`);

  try {
    var ip: dns.LookupAddress = await dnsLookup(job.data.host);
    logger.debug(`${job.data.host}: IP ${ip.address}`);
  } catch (error) {
    logger.error(`${job.data.host}: IP ${error}`);
    throw error;
  }

  try {
    const result = await pingHost(ip.address);
    logger.debug(
      `${job.data.host} (${ip.address}) ${JSON.stringify(result, null, 2)}`
    );
    return result;
  } catch (error) {
    logger.error(
      `${job.data.host} (${ip.address}) ${JSON.stringify(error, null, 2)}`
    );
    throw error;
  }
}
