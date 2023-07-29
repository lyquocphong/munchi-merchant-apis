import { Injectable, Inject, forwardRef } from '@nestjs/common';
import moment from 'moment';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthTokens } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { UserDto } from './dto/user.dto';
import { plainToClass } from 'class-transformer';
import { SessionService } from 'src/auth/session.service';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UtilsService)) private readonly utils: UtilsService,
    @Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService,
    @Inject(forwardRef(() => OrderingIoService)) private readonly orderingIo: OrderingIoService,
  ) {}

  async getUser(userId: number) {
    const accessToken = await this.utils.getAccessToken(userId);
    try {
      const response = await this.orderingIo.getUser(accessToken, userId);
      return plainToClass(UserDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  getUserInternally = async (userId: number, publicUserId: string) => {
    if (userId === null) {
      const user = await this.prisma.user.findUnique({
        where: {
          publicId: publicUserId,
        },
        include: {
          business: true,
        },
      });
      return user;
    } else {
      const user = await this.prisma.user.findUnique({
        where: {
          userId: userId,
        },
        include: {
          business: true,
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
  async getUserByUserId(userId: number) {
    return await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
      select: {
        firstName: true,
        lastname: true,
        email: true,
        publicId: true,
        level: true,
        userId: true,
        session: {
          select: {
            accessToken: true,
            expiresAt: true,
            tokenType: true,
          },
        },
        business: {
          select: {
            publicId: true,
            name: true,
          },
        },
        refreshToken: true,
      },
    });
  }
  async getUserByPublicId(publicUserId: string) {
    return await this.prisma.user.findUnique({
      where: {
        publicId: publicUserId,
      },
      include: {
        business: true,
        session: true,
      },
    });
  }

  async createUser(userData: any, tokens: AuthTokens, password: string) {
    const hashPassword = this.utils.getPassword(password, true);
    const { access_token, token_type, expires_in } = userData.session;
    const expiredAt = moment(moment()).add(expires_in, 'milliseconds').format();
    const hashedRefreshToken = await this.sessionService.hashData(tokens.refreshToken);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          userId: userData.id,
          firstName: userData.name,
          lastname: userData.lastname,
          email: userData.email,
          hash: hashPassword,
          level: userData.level,
          publicId: this.utils.getPublicId(),
          session: {
            create: {
              accessToken: access_token,
              expiresAt: expiredAt,
              tokenType: token_type,
              deviceId
            },
          },
          refreshToken: hashedRefreshToken,
        },
        select: {
          firstName: true,
          lastname: true,
          email: true,
          publicId: true,
          level: true,
          refreshToken: true,
          session: true
        },
      });
      return new UserResponse(
        newUser.email,
        newUser.firstName,
        newUser.lastname,
        newUser.level,
        newUser.publicId,
        tokens.verifyToken,
        tokens.refreshToken,
        newUser.session.
      );
    } catch (error) {
      this.utils.logError(error);
    }
  }
}
