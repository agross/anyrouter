import { Logger } from '@nestjs/common';
import Joi = require('@hapi/joi');
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { HostDescription } from './model/host-description';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly envConfig: { [key: string]: any };

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);

    this.logger.log(`Config: ${JSON.stringify(this.envConfig, null, 2)}`);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const schema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production')
        .default('development'),
      HTTP_PORT: Joi.number()
        .default(3000)
        .description('Port the application listens on'),
      GATEWAYS: Joi.string()
        .optional()
        .allow('')
        .custom(this.getHostDescriptions)
        .description('Useable gateways'),
      PING: Joi.string()
        .optional()
        .allow('')
        .custom(this.getHostDescriptions)
        .description('Hosts to ping'),
      ENABLE_CORS: Joi.boolean()
        .default(false)
        .description('Enable CORS for development'),
    });

    const { error, value: validatedConfig } = schema.validate(envConfig);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedConfig;
  }

  private getHostDescriptions(value: any): HostDescription[] {
    return value
      .split(',')
      .filter(entry => entry.length > 0)
      .map(hostDescription => hostDescription.split('='))
      .map(descriptionAndHost => {
        let [description, host] = descriptionAndHost;
        if (!host) {
          host = description;
        }

        return {
          description,
          host,
        };
      });
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  get httpPort(): number {
    return Number(this.envConfig.HTTP_PORT);
  }

  get pingHosts(): HostDescription[] {
    return (this.envConfig.PING || []) as HostDescription[];
  }

  get gateways(): HostDescription[] {
    return (this.envConfig.GATEWAYS || []) as HostDescription[];
  }

  get enableCors(): boolean {
    return Boolean(this.envConfig.ENABLE_CORS);
  }
}
