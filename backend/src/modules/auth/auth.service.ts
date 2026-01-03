
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: (user as any).role, // role is now a rich object with permissions
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(registerDto: RegisterDto) {
    // This is a simplified registration.
    // In a real multi-tenant app, you'd handle organization creation here.
    const user = await this.usersService.create(registerDto);
    
    // Omit password hash from the returned user object
    const { passwordHash, ...result } = user;
    return result;
  }
}
