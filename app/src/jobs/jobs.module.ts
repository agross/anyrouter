import { Module, DynamicModule, Global, Logger } from '@nestjs/common';
import { BullModule, BullQueueAdvancedSeparateProcessor } from 'nest-bull';
import { JobsService } from './jobs.service';
import * as path from 'path';
import * as glob from 'glob';
import { ConfigModule } from '../config/config.module';

@Global()
@Module({})
export class JobsModule {
  private static readonly logger = new Logger(JobsModule.name);

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

    this.logger.log(`Queue processors: ${JSON.stringify(processors, null, 2)}`);

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
      imports: [queue, ConfigModule],
      providers: [JobsService],
      exports: [queue]
    };
  }
}
