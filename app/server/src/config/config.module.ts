import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

export function configFile() {
  return `${process.env.NODE_ENV || 'development'}.env`;
}

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(configFile()),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
