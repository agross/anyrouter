import { Module, DynamicModule, Global } from '@nestjs/common';
import { BullModule, BullQueueAdvancedSeparateProcessor } from 'nest-bull';
import { JobsService } from './jobs.service';
import * as path from 'path';
import * as glob from 'glob';

@Global()
@Module({})
export class JobsModule {
  static register(): DynamicModule {
    const processors: BullQueueAdvancedSeparateProcessor[] = glob
      .sync(path.join(__dirname, 'worker', '*.js'))
      .map(fn => {
        return {
          name: path.basename(fn, path.extname(fn)),
          path: fn,
          concurrency: 2
        };
      });

    console.log(processors);

    const queue = BullModule.register({
      name: 'store',
      options: {
        redis: {
          port: 6379
        }
      },
      processors: processors
    });

    return {
      module: JobsModule,
      imports: [queue],
      providers: [JobsService],
      exports: [queue]
    };
  }
}
