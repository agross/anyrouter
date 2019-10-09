import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from 'nest-bull';
import * as path from 'path';
import * as glob from 'glob';

const processors = glob.sync(path.join(__dirname, 'jobs', '*.js')).map(fn => {
  return {
    name: path.basename(fn, path.extname(fn)),
    path: fn
  };
});

console.log(processors);

@Module({
  imports: [
    BullModule.register({
      name: 'store',
      options: {
        redis: {
          port: 6379
        }
      },
      processors: processors
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
