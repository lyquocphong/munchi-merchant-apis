/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import moment from 'moment';
import { SessionService } from 'src/auth/session.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UtilsService {
  constructor(
    @Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
    private config: ConfigService,
  ) {}
  getEnvUrl(path: string, idParam?: string | number, queryParams?: Array<string>): string {
    let envUrl = `${process.env.BASE_URL}/${path}`;
    if (idParam === null || idParam === undefined) return envUrl;
    else envUrl = `${process.env.BASE_URL}/${path}/${idParam}`;
    return envUrl;
  }

  async getAccessToken(userId: number) {
    const session = await this.sessionService.getSession(userId);
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!user || !session) {
      throw new ForbiddenException('Access Denied');
    }

    const decryptedPassword = this.getPassword(user.hash, false);
    const expireAt = moment(session.expiresAt).format();
    const diff = moment(expireAt).diff(moment(), 'minutes');

    if (diff <= 60) {
      try {
        await this.sessionService.updateOrderingIoAccessToken({
          email: user.email,
          password: decryptedPassword,
        });
        const newSession = await this.sessionService.getSession(userId);
        return newSession.accessToken;
      } catch (error) {
        this.logError(error);
      }
    }
    return session.accessToken;
  }

  async getUpdatedPublicId(publicUserId: string) {
    const newPublicUserId = this.getPublicId();
    await this.prisma.user.update({
      where: {
        publicId: publicUserId,
      },
      data: {
        publicId: newPublicUserId,
      },
    });
    return 'Signed out successfully';
  }

  getPublicId() {
    const publicId = uuidv4();
    return publicId;
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

  logError(error: any) {
    if (error.response) {
      const errorMsg = error.response.data;
      throw new ForbiddenException(errorMsg);
    } else {
      throw new ForbiddenException(error);
    }
  }
}
