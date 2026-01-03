
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let adminAuthToken: string;
  let allPermissions: any[];
  let createdRoleId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const uniqueEmail = `test-admin-roles-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Admin User', email: uniqueEmail, password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });

    adminAuthToken = loginRes.body.access_token;
    
    // As a company-admin, fetch all available permissions to be used in tests
    const permRes = await request(app.getHttpServer())
        .get('/api/v1/roles/permissions')
        .set('Authorization', `Bearer ${adminAuthToken}`);
    allPermissions = permRes.body;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /roles -> should get the default roles for a new organization', async () => {
    const res = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);
    
    expect(res.body).toHaveLength(2); // company-admin and user
    expect(res.body.find((r: any) => r.name === 'company-admin')).toBeDefined();
    expect(res.body.find((r: any) => r.name === 'user')).toBeDefined();
  });

  it('POST /roles -> should create a new custom role', async () => {
    const accountReadPerm = allPermissions.find(p => p.key === 'account:read');
    const accountCreatePerm = allPermissions.find(p => p.key === 'account:create');
    
    const res = await request(app.getHttpServer())
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({ 
          name: 'Sales Rep', 
          description: 'Can read and create accounts',
          permissionIds: [accountReadPerm.id, accountCreatePerm.id],
      })
      .expect(201);
      
      expect(res.body).toBeDefined();
      expect(res.body.name).toEqual('Sales Rep');
      createdRoleId = res.body.id;
  });

  it('GET /roles/:id -> should get the newly created role', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      expect(res.body.name).toEqual('Sales Rep');
      expect(res.body.permissions).toHaveLength(2);
      expect(res.body.permissions.find((p: any) => p.permission.key === 'account:read')).toBeDefined();
  });

  it('PATCH /roles/:id -> should update the permissions for a role', async () => {
      const accountUpdatePerm = allPermissions.find(p => p.key === 'account:update');
      
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
            permissionIds: [accountUpdatePerm.id]
        })
        .expect(200);
      
      expect(res.body.permissions).toHaveLength(1);
      expect(res.body.permissions[0].permission.key).toEqual('account:update');
  });

  it('DELETE /roles/:id -> should delete a custom role', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200); // Should be 200 ok for successful deletion
  });

  it('DELETE /roles/:id -> should fail to delete a system role', async () => {
      // First, find the id of the 'user' role
      const rolesRes = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      const userRole = rolesRes.body.find((r: any) => r.name === 'user');

      await request(app.getHttpServer())
        .delete(`/api/v1/roles/${userRole.id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(403); // Forbidden
  });
});
