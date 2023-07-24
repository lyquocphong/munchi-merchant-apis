import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import moment from 'moment';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthCredentials } from 'src/type';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';
import { SessionService } from './session.service';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private user: UserService,
    @Inject(forwardRef(() => OrderingIoService)) private readonly orderingIo: OrderingIoService,
    @Inject(forwardRef(() => UtilsService)) readonly utils: UtilsService,
    @Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService,
    private config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(credentials: AuthCredentials) {
    const response = await this.orderingIo.signIn(credentials);
    const tokens = await this.sessionService.getTokens(response.id, response.email);
    const { access_token, token_type, expires_in } = response.session;
    const expiredAt = moment(moment()).add(expires_in, 'milliseconds').format();
    const user = await this.user.getUserByUserId(response.id);

    if (!user) {
      const newUser = await this.user.createUser(response, tokens, credentials);
      return newUser;
    } else if (user && !user.session) {
      await this.sessionService.createSession(user.userId, {
        accessToken: access_token,
        expiresAt: expiredAt,
        tokenType: token_type,
      });
    }

    await this.sessionService.updateTokens(response.id, tokens.refreshToken, {
      accessToken: access_token,
      expiresAt: expiredAt,
      tokenType: token_type,
    });

    return new UserResponse(
      user.email,
      user.firstName,
      user.lastname,
      user.level,
      user.publicId,
      tokens.verifyToken,
      tokens.refreshToken,
    );
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

  async signOut(userId: number) {
    const accessToken = await this.utils.getAccessToken(userId);
    await this.orderingIo.signOut(accessToken);
    await this.prisma.session.delete({
      where: {
        userId: userId,
      },
    });
  }
}
