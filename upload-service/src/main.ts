import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3008;

    await app.listen(port);
    logger.log(`HTTP server is running on port ${port}`);
  } catch (error) {
    logger.error(`Failed to start HTTP server: ${error.message}`, error.stack);
    process.exit(1);
  }
}
bootstrap();