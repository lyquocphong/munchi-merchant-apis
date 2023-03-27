import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class BusinessService {
  constructor(private utils: UtilsService, private readonly prisma: PrismaService) {}
  async addBusiness(businsessData: any, userId: number) {
    const newBusinesses = await this.prisma.business.create({
      data: {
        businessId: businsessData.id,
        name: businsessData.name,
        publicId: this.utils.getPublicId(),
        userId: userId,
      },
    });
    return newBusinesses;
  }
  async getBusiness(businessId: number, userId: number) {
    if (businessId !== null) {
      return this.getBusinessById(businessId);
    } else if (businessId !== null && userId !== null) {
      return this.getDuplicateBusiness(businessId, userId);
    }
  }
  async getDuplicateBusiness(businessId: number, userId: number) {
    const business = await this.prisma.business.findMany({
      where: {
        businessId: businessId,
        userId: userId,
      },
    });
    return business;
  }

  async getBusinessByPublicId(publicBusinessId: string) {
    const business = await this.prisma.business.findUnique({
      where: {
        publicId: publicBusinessId,
      },
    });
    return business;
  }
  async getBusinessById(businessId: number) {
    const business = await this.prisma.business.findUnique({
      where: {
        businessId: businessId,
      },
    });
    return business;
  }

  async getAllBusiness(userId: number) {
    const business = await this.prisma.business.findMany({
      where: {
        userId: userId,
      },
      select: {
        name: true,
        publicId: true,
      },
    });
    return business;
  }
}
