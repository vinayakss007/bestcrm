
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('OpportunitiesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdAccountId: number;
  let createdOpportunityId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const uniqueEmail = `test-user-opps-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: uniqueEmail, password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });

    authToken = loginRes.body.access_token;
    
    const accountRes = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Parent Account for Opps' });
    createdAccountId = accountRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /opportunities -> should create a new opportunity', () => {
    return request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ 
          name: 'Big Deal Q4', 
          accountId: createdAccountId, 
          amount: 50000, 
          stage: 'Prospecting',
          closeDate: new Date().toISOString() 
        })
      .expect(201)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toEqual('Big Deal Q4');
        expect(res.body.amount).toEqual(50000);
        createdOpportunityId = res.body.id;
      });
  });

  it('GET /opportunities -> should return a list of opportunities', () => {
    return request(app.getHttpServer())
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('GET /opportunities/:id -> should return a single opportunity', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/opportunities/${createdOpportunityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toEqual(createdOpportunityId);
      });
  });

  it('PATCH /opportunities/:id -> should update an opportunity', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createdOpportunityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'Won' })
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.stage).toEqual('Won');
      });
  });

  it('GET /opportunities/stats -> should return opportunity stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/opportunities/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.totalRevenue).toBe(50000);
      expect(res.body.pipelineOpportunities).toBe(0);
  });

  it('DELETE /opportunities/:id -> should soft delete an opportunity', () => {
    return request(app.getHttpServer())
      .delete(`/api/v1/opportunities/${createdOpportunityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });
});
