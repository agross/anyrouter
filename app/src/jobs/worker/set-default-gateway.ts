import { Job } from 'bull';
import { spawn } from 'child_process';

export default async function(job: Job) {
  console.log(`${job.data.description} ${job.id}`);

  await new Promise((resolve, reject) => {
    const process = spawn('ip', ['route', 'del', 'default']);

    let output = '';
    process.stdout.on('data', chunk => {
      output += chunk.toString();
    });

    process.on('exit', code => {
      console.log(`Exit code is: ${code}`);

      if (code == 0) {
        resolve(code + ' ' + output);
      } else {
        reject(code + ' ' + output);
      }
    });
  });

  return new Promise((resolve, reject) => {
    const process = spawn('ip', [
      'route',
      'add',
      'default',
      'via',
      job.data.gateway
    ]);

    let output = '';
    process.stdout.on('data', chunk => {
      output += chunk.toString();
    });

    process.on('exit', code => {
      console.log(`Exit code is: ${code}`);

      if (code == 0) {
        resolve(code + ' ' + output);
      } else {
        reject(code + ' ' + output);
      }
    });
  });
}
