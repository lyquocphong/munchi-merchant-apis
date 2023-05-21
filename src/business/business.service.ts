import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class BusinessService {
  constructor(private utils: UtilsService, private readonly prisma: PrismaService) {}
  async createBusiness(businsessData: any, userId: number) {
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
      return this.findBusinessById(businessId);
    } else if (businessId !== null && userId !== null) {
      return this.findDuplicateBusiness(businessId, userId);
    }
  }
  async findDuplicateBusiness(businessId: number, userId: number) {
    const business = await this.prisma.business.findMany({
      where: {
        businessId: businessId,
        userId: userId,
      },
    });
    return business;
  }

  async findBusinessByPublicId(publicBusinessId: string) {
    const business = await this.prisma.business.findUnique({
      where: {
        publicId: publicBusinessId,
      },
    });
    return business;
  }
  async findBusinessById(businessId: number) {
    const business = await this.prisma.business.findUnique({
      where: {
        businessId: businessId,
      },
    });
    return business;
  }

  async findAllBusiness(userId: number) {
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
