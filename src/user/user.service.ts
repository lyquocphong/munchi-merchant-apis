import { Injectable, Inject, forwardRef } from '@nestjs/common';
import moment from 'moment';
import { AuthService } from 'src/auth/auth.service';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthTokens } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly utils: UtilsService,
    @Inject(forwardRef(() => AuthService))
    private readonly auth: AuthService,
  ) {}

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
    const expiredAt = moment(moment()).add('milliseconds', expires_in).format();
    const hashedRefreshToken = await this.auth.hashData(tokens.refreshToken);
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
          session: {
            select: {
              accessToken: true,
              expiresAt: true,
              tokenType: true,
            },
          },
          refreshToken: true,
        },
      });
      return new UserResponse(
        newUser.email,
        newUser.firstName,
        newUser.lastname,
        newUser.level,
        newUser.publicId,
        newUser.session,
        tokens.verifyToken,
        tokens.refreshToken,
      );
    } catch (error) {
      this.utils.logError(error);
    }
  }
}
