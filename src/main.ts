import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './application/modules/Auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.setGlobalPrefix('api');

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('API E-commerce')
    .setDescription('Documentation de l’API e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  await app.listen(5000);
}
bootstrap();