import { Injectable } from '@nestjs/common';
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
        include:{
            business:true
        }
      });
      return user;
    } else {
      const user = await this.prisma.user.findUnique({
        where: {
          userId: userId,
        },
        include:{
            business:true
        }
      });
      return user;
    }
  };
  checkExistUser = async (userId:number) => {
    const existedUser = await this.prisma.user.findUnique({
        where: {
            userId: userId
        }
    })
    if (existedUser) {
        return this.utils.getUser(userId,null)
    }
    else {
        return existedUser
    }
  } 
  deleteUser = async (userId: number) => {
    const user = await this.getUserInternally(userId,null)
    const deleteUser = await this.prisma.user.delete({
      where: {
        id: user.id
      }
    })
    console.log('deleted')
    console.log(deleteUser)
    return deleteUser
  }
}
