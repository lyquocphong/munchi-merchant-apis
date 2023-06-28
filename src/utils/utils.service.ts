/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Cryptr from 'cryptr';
import moment from 'moment';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UtilsService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => OrderingIoService))
    private orderingIo: OrderingIoService,
    private config: ConfigService,
  ) {}
  getEnvUrl(path: string, idParam?: string | number, queryParams?: Array<string>): string {
    let envUrl = `${process.env.BASE_URL}/${path}`;
    if (idParam === null || idParam === undefined) return envUrl;
    else envUrl = `${process.env.BASE_URL}/${path}/${idParam}`;
    return envUrl;
  }

  async getAccessToken(userId: number) {
    const session = await this.prisma.session.findUnique({
      where: {
        userId: userId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!user || !session) {
      throw new ForbiddenException('Access Denied');
    }

    const decryptedPassword = this.getPassword(user.hash, false);
    const expireAtmoment = moment(session.expiresAt).format();
    const diff = moment(expireAtmoment).diff(moment(), 'minutes');

    if (diff < 60) {
      try {
        await this.orderingIo.signIn({ email: user.email, password: decryptedPassword });
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
