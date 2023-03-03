import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private user: UserService,
    private config: ConfigService,
    private readonly jwt: JwtService,
  ) {}
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.user.getUser(userId, null);
    if (!user || !user.verifyToken) throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(user.verifyToken, refreshToken);
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const token = await this.signToken(user.userId, user.email);
    await this.updateRefreshToken(user.userId, token.verifyToken);
    return token;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    // await this.user.update(userId, {
    //   refreshToken: hashedRefreshToken,
    // });
  }
  hashData(data: string) {
    return argon2.hash(data);
  }
  async signToken(userId: number, email: string): Promise<{ verifyToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '4h',
      secret: secret,
    });
    return {
      verifyToken: token,
    };
  }
  getPassword(password: string, needCrypt: boolean) {
    const cryptr = new Cryptr(this.config.get('HASH_SECRET'));
    let passwordAfter: string;
    if (needCrypt) {
      passwordAfter = cryptr.encrypt(password);
    } else {
      passwordAfter = cryptr.decrypt(password);
    }
    return passwordAfter;
  }
}
