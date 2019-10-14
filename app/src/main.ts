import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { AppModule } from './app.module';
import * as path from 'path';
import Arena from 'bull-arena';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, '..', 'client'));

  const config = app.get(ConfigService);

  const logger = new Logger(__filename);
  logger.log(
    `Listening on port ${config.httpPort}, CORS: ${config.enableCors}`
  );

  if (config.enableCors) {
    app.enableCors();
  }

  const arena = Arena(
    {
      queues: [
        {
          name: 'store',
          hostId: 'local',
          redis: {
            port: 6379,
            host: '127.0.0.1'
          }
        }
      ]
    },
    { disableListen: true, basePath: '/arena' }
  );
  app.use(arena);

  await app.listen(config.httpPort);
}
bootstrap();
