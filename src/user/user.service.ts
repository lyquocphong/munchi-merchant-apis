import { Injectable } from '@nestjs/common';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthTokens } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private readonly utils: UtilsService) {}

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
    console.log('deleted');
    console.log(deleteUser);
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
        userId:true,
        session: {
          select: {
            accessToken: true,
            expiresIn: true,
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
  async saveUser(userData: any, tokens: AuthTokens, password: string) {
    const hashPassword = this.utils.getPassword(password, true);
    const { access_token, token_type, expires_in } = userData.session;
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
              expiresIn: expires_in,
              tokenType: token_type,
            },
          },
          refreshToken: tokens.refreshToken,
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
              expiresIn: true,
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
      console.log(error);
    }
  }
}
