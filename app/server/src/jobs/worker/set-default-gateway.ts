import { Job } from 'bull';
import { LoggerFactory } from '../logger-factory';
import { Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import NestedError from 'nested-error-stacks';

const logger = LoggerFactory.createLogger(__filename);

async function runProcess(
  logger: Logger,
  command: string,
  args?: readonly string[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    logger.debug(`Running ${command} ${args}`);
    const process = spawn(command, args);

    let output = '';
    process.stdout.on('data', chunk => {
      output += chunk.toString();
    });
    process.stderr.on('data', chunk => {
      output += chunk.toString();
    });

    process.on('error', error => {
      reject(
        new NestedError(
          `${command} ${args.join(' ')}: ${error.message}`,
          error,
        ),
      );
    });

    process.on('exit', code => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Exit code: ${code}\nOutput: ${output}`));
      }
    });
  });
}

export default async function(job: Job) {
  logger.debug(`${job.data.gateway} job ${job.id}`);

  await runProcess(logger, 'ip', ['route', 'del', 'default']);
  return runProcess(logger, 'ip', [
    'route',
    'add',
    'default',
    'via',
    job.data.gateway,
  ]).then(_ => {
    return {
      ip: job.data.gateway,
    };
  });
}
