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

  private test(value: any, helpers: Joi.CustomHelpers): any {
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
          description: description,
          host: host
        };
      });
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
        .custom(this.getHostDescriptions)
        .description('Useable gateways'),
      PING: Joi.string()
        .custom(this.getHostDescriptions)
        .description('Hosts to ping')
    });

    const { error, value: validatedConfig } = schema.validate(envConfig);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedConfig;
  }

  private getHostDescriptions(
    value: any,
    _helpers: Joi.CustomHelpers
  ): HostDescription[] {
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
          description: description,
          host: host
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
    return this.envConfig.PING as HostDescription[];
  }

  get gateways(): HostDescription[] {
    return this.envConfig.GATEWAYS as HostDescription[];
  }
}
