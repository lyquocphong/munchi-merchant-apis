import { ForbiddenException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderId } from 'src/type';
import axios from 'axios';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { forwardRef } from '@nestjs/common/utils';
import { Inject } from '@nestjs/common/decorators';
import Cryptr from 'cryptr';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UtilsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => OrderingIoService))
    private orderingIo: OrderingIoService,
    private config: ConfigService,
  ) {}
  getEnvUrl(routeQuery: string, id?: string | number, param?: Array<String>): string {
    let envUrl = `${process.env.BASE_URL}/${routeQuery}`;
    if (id === null || id === undefined) return envUrl;
    else envUrl = `${process.env.BASE_URL}/${routeQuery}/${id}`;
    return envUrl;
  }
  async getAccessToken(userId: number) {
    const cryptr = new Cryptr(this.config.get('HASH_SECRET'));
    const sessionData = await this.prisma.session.findUnique({
      where: {
        userId: userId,
      },
    });
    const expiredAt = moment().add(sessionData.expiresIn, 'milliseconds').format('X');

    const now = moment().format('X');
    const userData = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (expiredAt < now) {
      const decryptedPassword = cryptr.decrypt(userData.hash);
      const email = userData.email;
      const options = {
        method: 'POST',
        url: this.getEnvUrl('auth'),
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        data: {
          email: email,
          password: decryptedPassword,
          security_recaptcha_auth: '0',
        },
      };
      try {
        const response = await axios.request(options);
        const signInResponseObject = response.data.result;
        const { access_token, token_type, expires_in } = signInResponseObject.session;
        const existingUser = await this.prisma.user.findUnique({
          where: {
            id: signInResponseObject.id,
          },
        });
        if (existingUser) {
          await this.prisma.user.update({
            where: {
              id: signInResponseObject.id,
            },
            data: {
              session: {
                update: {
                  accessToken: access_token,
                  expiresIn: expires_in,
                },
              },
            },
          });
          return access_token;
        }
      } catch (error) {
        const errorMsg = error.response.data.result;
        throw new ForbiddenException(errorMsg);
      }
    }

    return sessionData.accessToken;
  }
}
