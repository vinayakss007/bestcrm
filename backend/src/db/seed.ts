
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const permissions = [
    { key: 'user:create', description: 'Can create (invite) new users' },
    { key: 'user:read', description: 'Can view list of users' },
    { key: 'user:update', description: 'Can update user details/role' },
    { key: 'user:delete', description: 'Can delete/deactivate a user' },

    { key: 'role:create', description: 'Can create a new role' },
    { key: 'role:read', description: 'Can view roles and their permissions' },
    { key: 'role:update', description: 'Can update a role\'s permissions' },
    { key: 'role:delete', description: 'Can delete a custom role' },

    { key: 'account:create', description: 'Can create accounts' },
    { key: 'account:read', description: 'Can read accounts' },
    { key: 'account:update', description 'Can update accounts' },
    { key: 'account:delete', description: 'Can delete accounts' },
    { key: 'account:export', description: 'Can export accounts to CSV' },
    
    { key: 'contact:create', description: 'Can create contacts' },
    { key: 'contact:read', description: 'Can read contacts' },
    { key: 'contact:update', description: 'Can update contacts' },
    { key: 'contact:delete', description: 'Can delete contacts' },

    { key: 'lead:create', description: 'Can create leads' },
    { key: 'lead:read', description: 'Can read leads' },
    { key: 'lead:update', description: 'Can update leads' },
    { key: 'lead:delete', description: 'Can delete leads' },
    { key: 'lead:convert', description: 'Can convert leads' },

    { key: 'opportunity:create', description: 'Can create opportunities' },
    { key: 'opportunity:read', description: 'Can read opportunities' },
    { key: 'opportunity:update', description: 'Can update opportunities' },
    { key: 'opportunity:delete', description: 'Can delete opportunities' },

    { key: 'invoice:create', description: 'Can create invoices' },
    { key: 'invoice:read', description: 'Can read invoices' },
    { key: 'invoice:update', description: 'Can update invoices' },
    { key: 'invoice:delete', description: 'Can delete invoices' },

    { key: 'task:create', description: 'Can create tasks' },
    { key: 'task:read', description: 'Can read tasks' },
    { key: 'task:update', description: 'Can update tasks' },
    { key: 'task:delete', description: 'Can delete tasks' },

    { key: 'attachment:create', description: 'Can upload attachments' },
    { key: 'attachment:read', description: 'Can view attachments' },
    { key: 'attachment:delete', description: 'Can delete attachments' },

    { key: 'comment:create', description: 'Can create comments' },

    { key: 'setting:brand:update', description: 'Can update brand settings' },
    { key: 'setting:audit-log:read', description: 'Can view the audit log' },

    { key: 'super-admin:tenant:read', description: 'Can view all tenants' },
    { key: 'super-admin:tenant:impersonate', description: 'Can impersonate users' },
];

async function main() {
  console.log('Seeding permissions...');

  for (const p of permissions) {
    await db.insert(schema.crmPermissions).values(p).onConflictDoNothing();
  }
  
  console.log('Permissions seeded.');

  // Find the super-admin role
  const superAdminRole = await db.query.crmRoles.findFirst({
    where: eq(schema.crmRoles.name, 'super-admin'),
  });

  if (superAdminRole) {
    console.log('Found super-admin role. Assigning all permissions...');
    const allPermissions = await db.select({ id: schema.crmPermissions.id }).from(schema.crmPermissions);

    // Clear existing permissions for the role to ensure a clean slate
    await db.delete(schema.crmRolePermissions).where(eq(schema.crmRolePermissions.roleId, superAdminRole.id));

    // Assign all permissions to the super-admin role
    await db.insert(schema.crmRolePermissions).values(
      allPermissions.map(p => ({
        roleId: superAdminRole.id,
        permissionId: p.id,
      }))
    ).onConflictDoNothing();

    console.log('All permissions assigned to super-admin role.');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
