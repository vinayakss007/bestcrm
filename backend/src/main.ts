
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // In a real app, you would configure things like CORS
  app.enableCors(); 
  
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
