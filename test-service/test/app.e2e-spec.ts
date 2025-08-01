import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello from Test Service! 🚀');
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('test-service');
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.uptime).toBeDefined();
      });
  });

  it('/api/info (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/info')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Test Service');
        expect(res.body.version).toBe('1.0.0');
        expect(res.body.description).toBeDefined();
        expect(res.body.endpoints).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
}); 