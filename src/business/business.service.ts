/* eslint-disable prettier/prettier */
import { Injectable, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { BusinessDto } from './dto/business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private utils: UtilsService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => OrderingIoService)) private orderingIo: OrderingIoService,
  ) {}
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

  async getBusinessById(userId: number, publicBusinessId: string) {
    const accessToken = await this.utils.getAccessToken(userId);
    const business = await this.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException(`we need this: ${publicBusinessId}`);
    }
    const response = await this.orderingIo.getBusinessById(accessToken, business.businessId);
    const businessResponse = plainToClass(BusinessDto, response);
    return businessResponse;
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
