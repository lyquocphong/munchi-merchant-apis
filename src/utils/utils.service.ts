import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderId } from 'src/type';

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}
  getEnvUrl(routeQuery: string, id?: number, param?: Array<String>): string {
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
    return sessionData.accessToken
  }
}
