/* eslint-disable prettier/prettier */
import { Injectable, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { BusinessDto } from './dto/business.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BusinessService {
  constructor(
    private utils: UtilsService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
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

  async getAllBusiness(userId: number) {
    const accessToken = await this.utils.getAccessToken(userId);
    const response = await this.orderingIo.getAllBusiness(accessToken);
    const user = await this.userService.getUserInternally(userId, null);

    if (!user) {
      throw new ForbiddenException('Something wrong happend');
    }

    for (const business of response) {
      const existedBusiness = await this.findBusinessById(business.id);

      if (existedBusiness) {
        // Check ownership of the new user with existed business
        const owner = existedBusiness.owners.filter((owner) => owner.userId === user.userId);
        // If no ownership then add and update it to business
        if (owner.length < 1) {
          await this.updateBusinessOwners(business, user.userId);
        } else {
          return await this.findAllBusiness(user.userId);
        }
      } else {
        await this.createBusiness(business, user.userId);
      }
    }
    return await this.findAllBusiness(user.userId);
  }

  async getBusinessById(userId: number, publicBusinessId: string) {
    const accessToken = await this.utils.getAccessToken(userId);
    const business = await this.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException(`we need this: ${publicBusinessId}`);
    }
    const response = await this.orderingIo.getBusinessById(accessToken, business.businessId);
    return plainToClass(BusinessDto, response);
  }

  async editBusiness(userId: number, publicBusinessId: string, status: boolean) {
    const accessToken = await this.utils.getAccessToken(userId);
    const business = await this.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException(`we need this: ${publicBusinessId}`);
    }
    const response = await this.orderingIo.editBusiness(accessToken, business.businessId, status);
    return plainToClass(BusinessDto, response);
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
