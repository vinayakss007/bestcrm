
import { Injectable, ConflictException } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

// This is a mock user type. In a real app, this would come from your Drizzle schema.
export type User = {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'company-admin' | 'super-admin';
    organizationId: number;
};

// This is a mock database. In a real app, you would inject your Drizzle service.
const users: User[] = [];
let organizations = [{ id: 1, name: 'Default Org' }];
let userIdCounter = 1;
let orgIdCounter = 2;


@Injectable()
export class UsersService {
  // constructor(@Inject(DrizzleService) private db) {} // Real implementation

  async findOneByEmail(email: string): Promise<User | undefined> {
    // In a real app: return this.db.query.crmUsers.findFirst({ where: eq(crmUsers.email, email) });
    return users.find(user => user.email === email);
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.findOneByEmail(registerDto.email);
    if (existingUser) {
        throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Simplified logic: first user creates an org, subsequent could join
    let organizationId = 1;
    if (users.length > 0) {
      // In a real app, this would be based on an invite or domain matching
      organizationId = users[0].organizationId;
    }

    const newUser: User = {
        id: userIdCounter++,
        email: registerDto.email,
        name: registerDto.name,
        passwordHash,
        organizationId: organizationId,
        role: users.length === 0 ? 'company-admin' : 'user', // First user is an admin
    };

    users.push(newUser);
    // In a real app: return await this.db.insert(crmUsers).values(newUser).returning();
    return newUser;
  }
}
