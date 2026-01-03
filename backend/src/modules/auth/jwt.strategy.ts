
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT. Passport will attach this to the request object.
    // We can use this to identify the user and their organization.
    // The role is now an object containing the role name.
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}

      