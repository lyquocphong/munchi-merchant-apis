import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class BusinessService {
  constructor(private utils: UtilsService, private readonly prisma: PrismaService) {}
  async createBusiness(businsessData: any, userId: number) {
    return await this.prisma.business.create({
      data: {
        businessId: businsessData.id,
        name: businsessData.name,
        publicId: this.utils.getPublicId(),
        owners: {
          connect: {
            userId: userId,
          },
        },
      },
    });
  }

  async updateBusinessOwners(businsessData: any, userId: number) {
    return await this.prisma.business.update({
      where: {
        businessId: businsessData.id,
      },
      data: {
        owners: {
          connect: {
            userId: userId,
          },
        },
      },
    });
  }

  async findBusinessByPublicId(publicBusinessId: string) {
    return await this.prisma.business.findUnique({
      where: {
        publicId: publicBusinessId,
      },
    });
  }

  async findBusinessById(businessId: number) {
    const business = await this.prisma.business.findUnique({
      where: {
        businessId: businessId,
      },
      include: {
        owners: true,
      },
    });
    return business;
  }

  async findAllBusiness(userId: number) {
    return await this.prisma.business.findMany({
      where: {
        owners: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        name: true,
        publicId: true,
      },
    });
  }
}
