
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // In a real app, you would configure things like CORS
  app.enableCors(); 
  
  // Serve static files from the 'uploads' directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Add global prefix
  app.setGlobalPrefix('api/v1');

  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that do not have any decorators
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted values are provided
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  }));
  
  await app.listen(process.env.PORT || 3001); // Use port 3001 to avoid conflict with Next.js
}
bootstrap();
