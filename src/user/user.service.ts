import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import moment from 'moment';
import { SessionService } from 'src/auth/session.service';
import { OrderingUser } from 'src/ordering/ordering.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { UtilsService } from 'src/utils/utils.service';

type UserInfoSelectBase = {
  id: true;
  firstName: true;
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UtilsService)) private readonly utils: UtilsService,
    @Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService,
    @Inject(forwardRef(() => OrderingService)) private readonly Ordering: OrderingService,
  ) {}

  getUserInternally = async (orderingUserId: number, publicUserId: string) => {
    if (orderingUserId === null) {
      const user = await this.prisma.user.findUnique({
        where: {
          publicId: publicUserId,
        },
        include: {
          businesses: true,
        },
      });
      return user;
    } else {
      const user = await this.prisma.user.findUnique({
        where: {
          orderingUserId: orderingUserId,
        },
        include: {
          businesses: true,
        },
      });
      return user;
    }
  };

  deleteUser = async (userId: number) => {
    const user = await this.getUserInternally(userId, null);
    const deleteUser = await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return deleteUser;
  };

  async getUserByPublicId<S extends Prisma.UserSelect>(
    publicId: string,
    select?: S,
  ): Promise<Prisma.UserGetPayload<{ select: S }>> {
    return await this.prisma.user.findFirst({
      where: {
        publicId,
      },
      select,
    });
  }

  async getUserByOrderingUserId<S extends Prisma.UserSelect = UserInfoSelectBase>(
    orderingUserId: number,
    select: S,
  ) {
    return await this.prisma.user.findUnique({
      where: {
        orderingUserId,
      },
      select,
    });
  }

  async upsertUserFromOrderingInfo<S extends Prisma.UserSelect = UserInfoSelectBase>(
    userInfo: OrderingUser & { password: string },
    select: S,
  ) {
    const expiredAt = moment().utc().add(userInfo.session.expires_in, 'milliseconds');

    const data = {
      firstName: userInfo.name,
      lastName: userInfo.lastname,
      orderingUserId: userInfo.id,
      orderingAccessToken: userInfo.session.access_token,
      orderingAccessTokenExpiredAt: expiredAt.format(),
      email: userInfo.email,
      level: userInfo.level,
      hash: this.utils.getPassword(userInfo.password, true),
    };

    return await this.prisma.user.upsert({
      where: {
        orderingUserId: userInfo.id,
      },
      create: data,
      update: data,
      select,
    });
  }
}
