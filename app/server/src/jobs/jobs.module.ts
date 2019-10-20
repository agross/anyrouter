import { Module, DynamicModule, Logger } from '@nestjs/common';
import {
  BullModule,
  BullQueueAdvancedSeparateProcessor,
  BullModuleOptions
} from 'nest-bull';
import * as path from 'path';
import * as glob from 'glob';
import { ConfigModule } from '../config/config.module';
import { JobsService } from './jobs.service';

@Module({})
export class JobsModule {
  private static readonly logger = new Logger(JobsModule.name);

  public static get queues(): BullModuleOptions[] {
    const processors: BullQueueAdvancedSeparateProcessor[] = glob
      .sync(path.join(__dirname, 'worker', '*.js'))
      .map(fn => {
        return {
          name: path.basename(fn, path.extname(fn)),
          path: fn,
          concurrency: 1
        };
      });

    return processors.map(p => {
      return {
        name: p.name,
        options: {
          settings: {
            maxStalledCount: 0
          },
          redis: {
            port: 6379
          }
        },
        processors: [p]
      };
    });
  }

  static register(): DynamicModule {
    const bull = BullModule.register(this.queues);

    return {
      module: JobsModule,
      imports: [ConfigModule, bull],
      providers: [JobsService],
      exports: [bull]
    };
  }
}
