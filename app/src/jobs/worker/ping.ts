import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as ping from 'net-ping';
import * as dns from 'dns';

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.log(`${job.data.description} ${job.id}`);

  const ip = await new Promise((resolve, reject) =>
    dns.lookup(job.data.host, (err, address) => {
      if (err) {
        reject(err);
      } else {
        resolve(address);
      }
    })
  );

  return new Promise(async (resolve, reject) => {
    const options = {
      retries: 0
    };

    const session = ping.createSession(options);

    session.on('error', function(error) {
      reject(error);
      session.close();
    });

    session.pingHost(ip, function(error, target, sent, received) {
      if (error) {
        reject(error);
      } else {
        var timeTaken = received - sent;
        resolve(`${target}: ${timeTaken} ms`);
      }
      session.close();
    });
  });
}
