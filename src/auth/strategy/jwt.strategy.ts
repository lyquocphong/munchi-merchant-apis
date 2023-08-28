import { SessionService } from 'src/auth/session.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtTokenPayload } from '../session.type';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private userService: UserService,
    private sessionService: SessionService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtTokenPayload) {
    const user = await this.userService.getUserByPublicId(payload.userPublicId);

    if (!user) {
      throw new ForbiddenException('Cannot find user from jwt token');
    }

    // Update access time for session
    this.sessionService.updateAccessTime(payload.sessionPublicId);

    return { ...payload, ...user };
  }
}
