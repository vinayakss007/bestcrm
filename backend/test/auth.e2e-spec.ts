
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  describe('/auth/register (POST)', () => {
    it('should register a new user and create a tenant', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ name, email: uniqueEmail, password })
        .expect(201)
        .then(res => {
            expect(res.body).toBeDefined();
            expect(res.body.email).toEqual(uniqueEmail);
            expect(res.body.name).toEqual(name);
            expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should fail to register if user already exists', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({ name, email: uniqueEmail, password })
            .expect(409);
    });

    it('should fail if email is invalid', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({ name, email: 'invalid-email', password })
            .expect(400);
    });

     it('should fail if password is too short', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({ name, email: `short-pw@test.com`, password: '123' })
            .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
     it('should log in the registered user and return a JWT', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: uniqueEmail, password })
            .expect(200)
            .then(res => {
                expect(res.body).toHaveProperty('access_token');
                expect(res.body.access_token).toBeDefined();
            });
     });

     it('should fail to log in with incorrect password', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: uniqueEmail, password: 'wrongpassword' })
            .expect(401);
     });

      it('should fail to log in with non-existent email', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'no-one@example.com', password: 'password' })
            .expect(401);
     });
  });
});
