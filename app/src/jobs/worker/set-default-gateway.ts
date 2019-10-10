import { Job } from 'bull';
import { spawn } from 'child_process';

export default async function(job: Job) {
  console.log('Setting default gateway ' + job.id);

  return new Promise((resolve, reject) => {
    const process = spawn('ip', ['-la']);

    process.on('exit', code => {
      console.log(`Exit code is: ${code}`);

      if (code == 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });

    // for await (const data of process.stdout) {
    //   console.log(`stdout from the child: ${data}`);
    //   return data;
    // }
  });
}
