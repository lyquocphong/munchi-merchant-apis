import { ForbiddenException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderId } from 'src/type';
import axios from 'axios';
@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}
  getEnvUrl(routeQuery: string, id?: string | number, param?: Array<String>): string {
    let envUrl = `${process.env.BASE_URL}/${routeQuery}`;
    if (id === null || id === undefined) return envUrl;
    else envUrl = `${process.env.BASE_URL}/${routeQuery}/${id}`;
    return envUrl;
  }
  async getAccessToken(userId: number) {
    const sessionData = await this.prisma.session.findUnique({
      where: {
        userId: userId,
      },
    });
    return sessionData.accessToken;
  }
  //sessionId
  //get expire token bang userId 
  async getTokenAfterExpired(expireIn: number, email: string, password: string) {
    const expiredAt = moment().add(expireIn, 'milliseconds').format('X');
    console.log(expiredAt);
    const now = moment().format('X');
    console.log(now);
    if (expiredAt < now) {
      const options = {
        method: 'POST',
        url: this.getEnvUrl('auth'),
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        data: {
          email: email,
          password: password,
          security_recaptcha_auth: '0',
        },
      };
      try {
        const response = await axios.request(options);
        const signInResponseOnject = response.data.result;
        const { access_token, token_type, expires_in } = signInResponseOnject.session;
        const existingUser = await this.prisma.user.findUnique({
          where: {
            id: signInResponseOnject.id,
          },
        });
        if (existingUser) {
          await this.prisma.user.update({
            where: {
              id: signInResponseOnject.id,
            },
            data: {
              session: {
                update: {
                  accessToken: access_token,
                },
              },
            },
          });
        }
      } catch (error) {
        const errorMsg = error.response.data.result;
        throw new ForbiddenException(errorMsg);
      }
    }
    return expiredAt;
  }
}
