import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class BusinessService {
  constructor(private utils: UtilsService, private readonly prisma: PrismaService) {}
  async updateBusiness(businessId: number, newUserId: number) {
    console.log(
      '🚀 ~ file: business.service.ts:9 ~ BusinessService ~ updateBusiness ~ newUserId',
      newUserId,
    );
    console.log('running');
    console.log(businessId);

    // const updateBusiness = await this.prisma.business.update({
    //   where: {
    //     businessId: businessId,
    //   },
    //   data: {
    //     userId: newUserId,
    //   },
    // });
    // return updateBusiness;

    const existedBusiness = await this.prisma.business.findFirst({
      where: {
        businessId: businessId,
        userId: newUserId,
      },
    });
    if (existedBusiness === null) {
      const updateBusiness = await this.prisma.business.update({
        where: {
          businessId: businessId,
        },
        data: {
          userId: newUserId,
        },
      });
      return updateBusiness;
    }
  }
  async addBusiness(businsessData: any, userId: number) {
    const newBusinesses = await this.prisma.business.create({
      data: {
        publicId: this.utils.getPublicId(),
        businessId: businsessData.id,
        name: businsessData.name,
        userId: userId,
      },
    });
    return newBusinesses;
  }
  async getBusiness(businessId: number, userId: number) {
    if (businessId === null) {
      const businessByUserId = await this.prisma.business.findMany({
        where: {
          userId: userId,
        },
        select: {
          publicId: true,
          name: true,
        },
      });
      return businessByUserId;
    } else if (businessId !== null && userId !== null) {
      const duplicatedBusiness = await this.prisma.business.findMany({
        where: {
          businessId: businessId,
          userId: userId,
        },
        select: {
          publicId: true,
          name: true,
        },
      });
      return duplicatedBusiness;
    } else {
      const businessByBusinessId = await this.prisma.business.findMany({
        where: {
          businessId: businessId,
        },
        select: {
          publicId: true,
          name: true,
        },
      });
      return businessByBusinessId;
    }
  }
  async getBusinessByPublicId(publicBusinessId: string) {
    const business = await this.prisma.business.findUnique({
      where: {
        publicId: publicBusinessId,
      },
    });
    return business;
  }
}
