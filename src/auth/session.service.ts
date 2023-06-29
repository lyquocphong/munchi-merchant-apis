import { ForbiddenException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { SessionDto } from './dto/session.dto';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentials } from 'src/type';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import moment from 'moment';
@Injectable()
export class SessionService {
  constructor(
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    @Inject(forwardRef(() => UtilsService)) readonly utils: UtilsService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    @Inject(forwardRef(() => OrderingIoService)) private readonly orderingIo: OrderingIoService,
    private readonly jwt: JwtService,
    private config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async hashData(data: string) {
    return argon2.hash(data);
  }

  async updateTokens(userId: number, refreshToken?: string, session?: SessionDto) {
    const data: any = {};

    if (refreshToken) {
      const hashedRefreshToken = await this.hashData(refreshToken);
      data.refreshToken = hashedRefreshToken;
    }

    if (session) {
      data.session = {
        update: {
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          tokenType: session.tokenType,
        },
      };
    }

    try {
      await this.prisma.user.update({
        where: {
          userId: userId,
        },
        data: data,
      });
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async updateOrderingIoAccessToken(credentials: AuthCredentials) {
    const response = await this.orderingIo.signIn(credentials);
    const { access_token, token_type, expires_in } = response.session;
    const expiredAt = moment(moment()).add(expires_in, 'milliseconds').format();
    await this.updateTokens(response.id, null, {
      accessToken: access_token,
      expiresAt: expiredAt,
      tokenType: token_type,
    });
  }
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.getUserByUserId(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Invalid Token');
    }

    const userByPublicId = await this.userService.getUserByPublicId(user.publicId);
    const token = await this.getTokens(userByPublicId.userId, user.email);
    await this.updateTokens(userByPublicId.userId, token.refreshToken, null);

    return token;
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
      expiresIn: '2h',
      secret: secret,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: refreshSecret,
    });
    return {
      verifyToken: verifyToken,
      refreshToken: refreshToken,
    };
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

  async updateToken(userId: number) {
    const user = await this.userService.getUserInternally(userId, null);
    const decryptPassword = this.utils.getPassword(user.hash, false);
    return await this.authService.signIn({
      email: user.email,
      password: decryptPassword,
    });
  }

  async getSession(userId: number) {
    return await this.prisma.session.findUnique({
      where: {
        userId: userId,
      },
    });
  }
}
