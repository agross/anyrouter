import { configFile } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { Logger } from '@nestjs/common';
import * as path from 'path';

export class LoggerFactory {
  public static createLogger(workerFile: string): Logger {
    const logLevel = new ConfigService(configFile()).logLevel;

    Logger.overrideLogger(logLevel);

    return new Logger(
      `${path.basename(workerFile, path.extname(workerFile))} worker`,
    );
  }
}
