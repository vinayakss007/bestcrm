
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AccountsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdAccountId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login a user to get a token
    const uniqueEmail = `test-user-accounts-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: uniqueEmail, password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /accounts -> should create a new account', () => {
    return request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Account Inc.', industry: 'Testing' })
      .expect(201)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toEqual('Test Account Inc.');
        expect(res.body.industry).toEqual('Testing');
        createdAccountId = res.body.id;
      });
  });

  it('GET /accounts -> should return a list of accounts', () => {
    return request(app.getHttpServer())
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });

  it('GET /accounts/:id -> should return a single account', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toEqual(createdAccountId);
        expect(res.body.name).toEqual('Test Account Inc.');
      });
  });

  it('PATCH /accounts/:id -> should update an account', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Test Account LLC' })
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.name).toEqual('Updated Test Account LLC');
      });
  });

  it('DELETE /accounts/:id -> should soft delete an account', () => {
    return request(app.getHttpServer())
      .delete(`/api/v1/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('GET /accounts/:id -> should still find the soft-deleted account by ID', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
          expect(res.body.isDeleted).toBe(true);
      });
  });

  it('GET /accounts -> should not return the soft-deleted account in the list', () => {
    return request(app.getHttpServer())
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        const found = res.body.data.find((acc: any) => acc.id === createdAccountId);
        expect(found).toBeUndefined();
      });
  });
});
