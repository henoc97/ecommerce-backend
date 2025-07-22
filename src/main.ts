import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './application/modules/app.module';

import * as crypto from 'crypto';
import { AppLogger } from './application/helpers/logger/logger.service';

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto.webcrypto || crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('API E-commerce')
    .setDescription('Documentation de l\'API e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const logger: AppLogger = new AppLogger();

  logger.log('🔥 Test log vers Loki Cloud !');
  logger.log('Test log - should appear in Loki Cloud');
  logger.error('Test error - should appear in Loki Cloud');


  await app.listen(5000);
}
bootstrap();