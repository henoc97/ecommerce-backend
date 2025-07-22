import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
const LokiTransport = require('winston-loki');
import { ElasticsearchTransport } from 'winston-elasticsearch';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ];

    // Vérifie le provider choisi : loki ou elastic
    const provider = process.env.LOG_PROVIDER;
    try {
      if (provider === 'loki') {
        transports.push(
          new LokiTransport({
            host: process.env.LOKI_URL || 'http://localhost:3100',
            basicAuth: `${process.env.LOKI_USER}:${process.env.LOKI_PASSWORD}`,
            labels: { job: 'nestjs-app' },
            json: true,
            interval: 5,
            clearOnError: true,
            onConnectionError: (err) => {
              console.error('Loki connection error =>', err);
            },
          }),
        );
      }

      if (provider === 'elastic') {
        transports.push(
          new ElasticsearchTransport({
            level: 'info',
            clientOpts: {
              node: process.env.ELASTIC_URL || 'http://localhost:9200',
            },
          }),
        );
      }
    } catch (error) {
      console.error(error)
    }


    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports,
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} - ${trace || ''}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
