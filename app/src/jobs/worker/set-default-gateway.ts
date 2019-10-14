import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { spawn } from 'child_process';

async function runProcess(
  logger: Logger,
  command: string,
  args?: readonly string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    logger.debug(`Running ${command} ${args}`);
    const process = spawn(command, args);

    process.on('error', error => {
      logger.error(error.message, error.stack);
      reject(error.stack);
    });

    let output = '';
    process.stdout.on('data', chunk => {
      output += chunk.toString();
    });
    process.stderr.on('data', chunk => {
      output += chunk.toString();
    });

    process.on('exit', code => {
      if (code == 0) {
        logger.log(`Status: ${code}`);
        logger.debug(`Output: ${output}`);

        resolve(output);
      } else {
        logger.error(`Status: ${code}`);
        logger.error(`Output: ${output}`);

        reject(`[${code}] ${output}`);
      }
    });
  });
}

export default async function(job: Job) {
  const logger = new Logger(
    `${path.basename(__filename, path.extname(__filename))} worker`
  );
  logger.debug(`${job.data.description} job ${job.id}`);

  await runProcess(logger, 'ip', ['route', 'del', 'default']);
  await runProcess(logger, 'ip', [
    'route',
    'add',
    'default',
    'via',
    job.data.gateway
  ]);
}
