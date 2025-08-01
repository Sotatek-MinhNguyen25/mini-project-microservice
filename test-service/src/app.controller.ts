import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'test-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('info')
  getInfo() {
    return {
      name: 'Test Service',
      version: '1.0.0',
      description: 'Simple test service for K8s deployment',
      endpoints: [
        'GET /api - Hello message',
        'GET /api/health - Health check',
        'GET /api/info - Service information'
      ]
    };
  }
} 