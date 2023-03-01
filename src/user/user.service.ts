import { Injectable } from '@nestjs/common';
import { UserResponse } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class UserService {
  constructor(private readonly utils: UtilsService, private prisma: PrismaService) {}

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
  checkExistUser = async (userId: number) => {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (existedUser) {
      return this.getUser(userId, null);
    } else {
      return existedUser;
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
  async getUser(userId: number, publicUserId: string) {
    if (userId === null) {
      const userByPublicUserId = await this.prisma.user.findUnique({
        where: {
          publicId: publicUserId,
        },
        select: {
          userId: true,
          email: true,
          firstName: true,
          lastname: true,
          publicId: true,
          level: true,
          business: {
            select: {
              publicId: true,
              name: true,
            },
          },
          session: {
            select: {
              accessToken: true,
              expiresIn: true,
              tokenType: true,
            },
          },
        },
      });
      const verifyToken = await this.utils.signToken(
        userByPublicUserId.userId,
        userByPublicUserId.email,
      );
      const userResponseByPublicUserId = new UserResponse(
        userByPublicUserId.email,
        userByPublicUserId.firstName,
        userByPublicUserId.lastname,
        userByPublicUserId.level,
        userByPublicUserId.publicId,
        userByPublicUserId.session,
        verifyToken.verifyToken,
      );
      return userResponseByPublicUserId;
    } else {
      const userByUserId = await this.prisma.user.findUnique({
        where: {
          userId: userId,
        },
        select: {
          userId: true,
          email: true,
          firstName: true,
          lastname: true,
          publicId: true,
          level: true,
          business: {
            select: {
              publicId: true,
              name: true,
            },
          },
          session: {
            select: {
              accessToken: true,
              expiresIn: true,
              tokenType: true,
            },
          },
        },
      });
      const verifyToken = await this.utils.signToken(userByUserId.userId, userByUserId.email);
      const userResponseByPublicUserId = new UserResponse(
        userByUserId.email,
        userByUserId.firstName,
        userByUserId.lastname,
        userByUserId.level,
        userByUserId.publicId,
        userByUserId.session,
        verifyToken.verifyToken,
      );
      return userResponseByPublicUserId;
    }
  }
  async createUser(data: any, password: string) {
    const encryptedPassword = this.utils.getPassword(password, true);
    const { access_token, token_type, expires_in } = data.session;
    const verifyToken = await this.utils.signToken(data.userId, data.email);
    const newUser = await this.prisma.user.create({
      data: {
        userId: data.id,
        firstName: data.name,
        lastname: data.lastname,
        email: data.email,
        hash: encryptedPassword,
        level: data.level,
        publicId: this.utils.getPublicId(),
        session: {
          create: {
            accessToken: access_token,
            expiresIn: expires_in,
            tokenType: token_type,
          },
        },
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
      },
    });
    const userResponse = new UserResponse(
      newUser.email,
      newUser.firstName,
      newUser.lastname,
      newUser.level,
      newUser.publicId,
      newUser.session,
      verifyToken.verifyToken,
    );
    return userResponse;
  }
}
