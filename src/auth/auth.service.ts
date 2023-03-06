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
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.user.getUserByUserId(userId);
    console.log(user);
    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const userByPublicId = await this.user.getUserByPublicId(user.publicId);
    const token = await this.getTokens(userByPublicId.userId, user.email);
    await this.updateRefreshToken(
      userByPublicId.userId,
      token.verifyToken,
      user.session.accessToken,
    );
    return token;
  }

  async updateRefreshToken(userId: number, refreshToken: string, accessToken: string) {
    console.log(refreshToken);
    const hashedRefreshToken = await this.hashData(refreshToken);
    try {
      await this.prisma.user.update({
        where: {
          userId: userId,
        },
        data: {
          refreshToken: hashedRefreshToken,
          session: {
            update: {
              accessToken: accessToken,
            },
          },
        },
      });
    } catch (error) {
      this.utils.getError(error);
    }
  }
  hashData(data: string) {
    return argon2.hash(data);
  }
  async getTokens(
    userId: number,
    email: string,
  ): Promise<{ verifyToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');
    const verifyToken = await this.jwt.signAsync(payload, {
      expiresIn: '4h',
      secret: secret,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: refreshSecret,
    });
    return {
      verifyToken: verifyToken,
      refreshToken: refreshToken,
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
