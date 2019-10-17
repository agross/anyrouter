import { Module, DynamicModule, Logger } from '@nestjs/common';
import { BullModule, BullQueueAdvancedSeparateProcessor } from 'nest-bull';
import * as path from 'path';
import * as glob from 'glob';
import { ConfigModule } from '../config/config.module';

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
          concurrency: 1
        };
      });

    this.logger.debug(
      `Queue processors: ${JSON.stringify(processors, null, 2)}`
    );

    const queue = BullModule.register({
      name: 'store',
      options: {
        settings: {
          maxStalledCount: 0
        },
        redis: {
          port: 6379
        }
      },
      processors: processors
    });

    return {
      module: JobsModule,
      imports: [queue, ConfigModule],
      providers: [],
      exports: [queue]
    };
  }
}
