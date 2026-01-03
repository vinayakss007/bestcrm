
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ContactsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdAccountId: number;
  let createdContactId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login a user to get a token
    const uniqueEmail = `test-user-contacts-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: uniqueEmail, password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });

    authToken = loginRes.body.access_token;
    
    // Create an account to associate contacts with
    const accountRes = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Parent Account for Contacts' });
    createdAccountId = accountRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /contacts -> should create a new contact', () => {
    return request(app.getHttpServer())
      .post('/api/v1/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'John Doe', email: 'john.doe@contact.com', phone: '111-222-3333', accountId: createdAccountId })
      .expect(201)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toEqual('John Doe');
        expect(res.body.accountId).toEqual(createdAccountId);
        createdContactId = res.body.id;
      });
  });

  it('GET /contacts -> should return a list of contacts', () => {
    return request(app.getHttpServer())
      .get('/api/v1/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });
  
  it('GET /accounts/:accountId/contacts -> should return contacts for a specific account', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/accounts/${createdAccountId}/contacts`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(res => {
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data[0].id).toEqual(createdContactId);
        });
  });

  it('GET /contacts/:id -> should return a single contact', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/contacts/${createdContactId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toEqual(createdContactId);
        expect(res.body.name).toEqual('John Doe');
      });
  });

  it('PATCH /contacts/:id -> should update a contact', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/contacts/${createdContactId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Jane Doe Updated' })
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.name).toEqual('Jane Doe Updated');
      });
  });

  it('DELETE /contacts/:id -> should soft delete a contact', () => {
    return request(app.getHttpServer())
      .delete(`/api/v1/contacts/${createdContactId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('GET /contacts/:id -> should fail to find the soft-deleted contact', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/contacts/${createdContactId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
