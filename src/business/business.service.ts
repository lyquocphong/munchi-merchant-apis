import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class BusinessService {
  constructor(private utils: UtilsService, private readonly prisma: PrismaService) {}
  async updateBusiness(businessId: number, newUserId: number) {
    // const existingBusiness = await this.prisma.business.findMany({
    //   where: {
    //     id: businessId,
    //   }
    // })
    // if (!existingBusiness) {
    // }
    const updateBusiness = await this.prisma.business.update({
      where: {
        id: businessId,
      },
      data: {
        userId: newUserId,
      },
    });
    return updateBusiness;
  }
  async addBusiness(businsessData: any, userId: number) {
    // const existingBusiness = await this.prisma.business.findMany({
    //   where: {
    //     id: businessId,
    //   }
    // })
    // if (!existingBusiness) {
    // }
    const updateBusiness = await this.prisma.business.create({
      data: {
        publicId: this.utils.getPublicId(),
        businessId: businsessData.id,
        name: businsessData.name,
        userId: userId,
      },
    });
    return updateBusiness;
  }
  async getBusiness(businessId: number) {
    const business = await this.prisma.business.findMany({
      where: {
        businessId: businessId,
      },
    });
    return business;
  }
}
