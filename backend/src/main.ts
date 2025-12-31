import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // In a real app, you would configure things like CORS, validation pipes, etc.
  // app.enableCors();
  // app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}
bootstrap();
