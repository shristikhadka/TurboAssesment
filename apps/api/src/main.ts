/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add root route handler using Express directly
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (req, res) => {
    res.json({
      message: 'TurboVets Assessment API',
      version: '1.0.0',
      endpoints: {
        api: '/api',
        info: 'All API endpoints are available under /api prefix'
      }
    });
  });
  
  // Note: Global prefix is set in AppController, not here
  // This allows us to have a root route without the /api prefix
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
  Logger.log(`📍 Root endpoint: http://localhost:${port}/`);
  Logger.log(`📍 API endpoint: http://localhost:${port}/api`);
}

bootstrap();
