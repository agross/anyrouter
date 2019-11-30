import { Logger, LogLevel } from '@nestjs/common';
import Joi = require('@hapi/joi');
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { HostDescription } from './model/host-description';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  public readonly envConfig: { [key: string]: any };

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const joi = this.extendJoi(Joi);

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
      FRITZBOX: Joi.string()
        .optional()
        .allow('')
        .custom(this.getHostDescriptions)
        .description('FRITZ!Box hosts to monitor'),
      PING: Joi.string()
        .optional()
        .allow('')
        .custom(this.getHostDescriptions)
        .description('Hosts to ping'),
      ENABLE_CORS: Joi.boolean()
        .default(false)
        .description('Enable CORS for development'),
      LOG_LEVEL: joi.logLevel().description('Enabled log levels'),
    });

    const { error, value: validatedConfig } = schema.validate(envConfig);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedConfig;
  }

  private extendJoi(root: Joi.Root) {
    const logLevels = 'error,warn,log,debug,verbose'.split(',');

    return root.extend(joi => ({
      type: 'logLevel',
      base: joi
        .array()
        .items(Joi.string().valid(...logLevels))
        .default(logLevels),
      coerce: (value, _helpers) => {
        if (typeof value !== 'string') {
          return value;
        }

        const levels = value.replace(/^,+|,+$/gm, '').split(',');

        return { value: levels };
      },
    }));
  }

  private getHostDescriptions(value: any): HostDescription[] {
    return value
      .split(',')
      .filter((entry: string) => entry.length > 0)
      .map((hostDescription: string) => hostDescription.split('='))
      .map((descriptionAndHost: string[]) => {
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

  get fritzboxHosts(): HostDescription[] {
    return (this.envConfig.FRITZBOX || []) as HostDescription[];
  }

  get enableCors(): boolean {
    return Boolean(this.envConfig.ENABLE_CORS);
  }

  get logLevel(): LogLevel[] {
    return this.envConfig.LOG_LEVEL;
  }
}
