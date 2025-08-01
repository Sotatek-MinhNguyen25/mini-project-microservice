import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3010;
  await app.listen(port);
  
  console.log(`🚀 Test Service is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
}
bootstrap(); 