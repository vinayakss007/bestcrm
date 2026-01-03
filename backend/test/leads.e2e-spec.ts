
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('LeadsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdLeadId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login a user to get a token
    const uniqueEmail = `test-user-leads-${Date.now()}@example.com`;
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

  it('POST /leads -> should create a new lead', () => {
    return request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'New Lead Person', email: 'new.lead@example.com', source: 'Website' })
      .expect(201)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toEqual('New Lead Person');
        expect(res.body.status).toEqual('New');
        createdLeadId = res.body.id;
      });
  });

  it('GET /leads -> should return a list of leads', () => {
    return request(app.getHttpServer())
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });

  it('GET /leads/:id -> should return a single lead', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toEqual(createdLeadId);
        expect(res.body.name).toEqual('New Lead Person');
      });
  });

  it('PATCH /leads/:id -> should update a lead', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Contacted' })
      .expect(200)
      .then(res => {
        expect(res.body).toBeDefined();
        expect(res.body.status).toEqual('Contacted');
      });
  });

  it('POST /leads/:id/convert -> should convert a lead into an account, contact, and opportunity', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/leads/${createdLeadId}/convert`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ accountName: 'New Lead Company', opportunityName: 'New Lead Deal' })
      .expect(200);
      
    expect(res.body).toHaveProperty('opportunityId');
    const opportunityId = res.body.opportunityId;

    // Verify the opportunity was created
    const oppRes = await request(app.getHttpServer())
        .get(`/api/v1/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${authToken}`);
    
    expect(oppRes.status).toBe(200);
    expect(oppRes.body.name).toBe('New Lead Deal');

    // Verify original lead is now qualified/deleted
    const leadRes = await request(app.getHttpServer())
        .get(`/api/v1/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);
    
    expect(leadRes.status).toBe(404);
  });
});
