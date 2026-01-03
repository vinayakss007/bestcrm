
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminAuthToken: string;
  let adminUserId: number;
  let organizationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const uniqueEmail = `test-admin-users-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Admin User for Users Test', email: uniqueEmail, password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });

    adminAuthToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users -> should get a list of users in the organization', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1); // Only the admin user exists initially
    expect(res.body[0].role.name).toBe('company-admin');
    adminUserId = res.body[0].id;
    organizationId = res.body[0].organizationId;
  });

  it('POST /users/invite -> should invite a new user to the organization', async () => {
      const newUserEmail = `invited-user-${Date.now()}@example.com`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/users/invite')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
            name: 'Invited User',
            email: newUserEmail,
            password: 'password123',
            roleName: 'user',
        })
        .expect(201);
    
    expect(res.body.email).toBe(newUserEmail);
    expect(res.body.organizationId).toBe(organizationId);

    // Verify the new user can log in
    const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: newUserEmail, password: 'password123' })
        .expect(200);
    
    expect(loginRes.body.access_token).toBeDefined();
  });

  it('GET /users -> should now show two users in the organization', async () => {
     const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);
    
    expect(res.body.length).toBe(2);
  });

  it('PATCH /users/:id -> should update a user profile', async () => {
      const newName = "Admin User Updated";
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({ name: newName })
        .expect(200);
    
    expect(res.body.name).toBe(newName);
  });
});
