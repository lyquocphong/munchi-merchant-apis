import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import { JwtService } from '@nestjs/jwt';
import { SessionDto } from './dto/session.dto';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { AuthCredentials } from 'src/type';
import moment from 'moment';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private user: UserService,
    private readonly orderingIo: OrderingIoService,
    private config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.user.getUserByUserId(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Invalid Token');
    }

    const userByPublicId = await this.user.getUserByPublicId(user.publicId);
    const token = await this.getTokens(userByPublicId.userId, user.email);
    await this.updateRefreshToken(userByPublicId.userId, token.refreshToken, null);

    return token;
  }

  async updateRefreshToken(userId: number, refreshToken: string, accessToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    if (!accessToken) {
      try {
        await this.prisma.user.update({
          where: {
            userId: userId,
          },
          data: {
            refreshToken: hashedRefreshToken,
          },
        });
      } catch (error) {
        this.utils.logError(error);
      }
    } else {
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
        this.utils.logError(error);
      }
    }
  }

  async hashData(data: string) {
    return argon2.hash(data);
  }

  async signIn(credentials: AuthCredentials) {
    const response: any = await this.orderingIo.signIn(credentials);
    const tokens = await this.getTokens(response.id, response.email);
    const { access_token, token_type, expires_in } = response.session;
    const expiredAt = moment(moment()).add(expires_in, 'milliseconds').format();
    const user = await this.user.getUserByUserId(response.id);

    if (!user) {
      const newUser = await this.user.createUser(response, tokens, credentials.password);
      return newUser;
    } else if (user && !user.session) {
      await this.createSession(user.userId, {
        accessToken: access_token,
        expiresAt: expiredAt,
        tokenType: token_type,
      });
    }

    await this.updateRefreshToken(response.id, tokens.refreshToken, access_token);

    return new UserResponse(
      user.email,
      user.firstName,
      user.lastname,
      user.level,
      user.publicId,
      user.session,
      tokens.verifyToken,
      tokens.refreshToken,
    );
  }

  async updateToken(userId: number) {
    const user = await this.user.getUserInternally(userId, null);
    const decryptPassword = this.utils.getPassword(user.hash, false);
    return await this.signIn({
      email: user.email,
      password: decryptPassword,
    });
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
      expiresIn: '1h',
      secret: secret,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '9h',
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

  async createSession(userId: number, session: SessionDto) {
    await this.prisma.session.create({
      data: {
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
        tokenType: session.tokenType,
        userId: userId,
      },
    });
  }

  async signOut(publicUserId: string) {
    const user = await this.user.getUserByPublicId(publicUserId);
    if (!user) {
      throw new ForbiddenException('No user exist');
    } else if (!user.session) {
      throw new ForbiddenException('No user session');
    }
    await this.orderingIo.signOut();
    await this.prisma.session.delete({
      where: {
        userId: user.userId,
      },
    });
  }
}
