/* eslint-disable prettier/prettier */
import { Injectable, Inject, forwardRef, ForbiddenException, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { BusinessDto } from './dto/business.dto';
import { UserService } from 'src/user/user.service';
import moment from 'moment-timezone';
import { Prisma } from '@prisma/client';
import { OrderingIoBusiness } from 'src/ordering.io/ordering.io.type';
import { BusinessInfoSelectBase } from './business.type';

@Injectable()
export class BusinessService {
  constructor(
    private utils: UtilsService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => OrderingIoService)) private orderingIo: OrderingIoService,
  ) { }
  async createBusiness(businsessData: any, orderingUserId: number) {
    return await this.prisma.business.create({
      data: {
        logo: businsessData.logo,
        orderingBusinessId: businsessData.id,
        name: businsessData.name,
        owners: {
          connect: {
            orderingUserId: orderingUserId,
          },
        },
      },
      select: {
        name: true,
        publicId: true,
        logo: true
      },
    });
  }

  async upsertBusinessFromOrderingInfo<S extends Prisma.BusinessSelect>(
    businessInfo: OrderingIoBusiness,
    select: S
  ): Promise<
    Prisma.BusinessGetPayload<{ select: S }>
  > {
    const data = {
      name: businessInfo.name,
      logo: businessInfo.logo,
      orderingBusinessId: businessInfo.id
    }

    return await this.prisma.business.upsert({
      where: {
        orderingBusinessId: businessInfo.id
      },
      create: data,
      update: data,
      select
    })
  }

  async getAllBusiness(orderingId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingId);
    const response = await this.orderingIo.getAllBusiness(accessToken);

    const user = await this.userService.getUserInternally(orderingId, null);

    if (!user) {
      throw new ForbiddenException('Something wrong happend');
    }

    // Need to update each business into our db
    const selectInfo = { ...BusinessInfoSelectBase, owners: true };
    const businessDtos = [];
    for (const business of response) {
      const existedBusiness = await this.upsertBusinessFromOrderingInfo(business, selectInfo);
      const owner = existedBusiness.owners.filter((owner) => owner.orderingUserId === user.orderingUserId);
      // If no ownership then add and update it to business
      if (owner.length < 1) {
        await this.updateBusinessOwners(business, user.orderingUserId);
      }

      businessDtos.push(plainToClass(BusinessDto, business));
    }

    return businessDtos;
    //return await this.findAllBusiness(user.orderingUserId, BusinessInfoSelectBase);
  }

  async getOrderingBusiness(userId: number, publicBusinessId: string) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    const business = await this.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException(`we need this: ${publicBusinessId}`);
    }
    return await this.orderingIo.getBusinessById(accessToken, business.orderingBusinessId);
  }

  /**
   * This function is used to set status for today on or off
   * 
   * This is used to set business is closed or not
   * 
   * @param userId 
   * @param publicId 
   * @param status 
   * @returns 
   */
  async setTodayScheduleStatus(userId: number, publicId: string, status: boolean) {
    const business = await this.getOrderingBusiness(userId, publicId);

    if (!business) {
      throw new NotFoundException('Cannot find business to set today schedule');
    }

    const { schedule } = business;
    const numberOfToday = moment().weekday();
    schedule[numberOfToday].enabled = status;
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    const response = await this.orderingIo.editBusiness(accessToken, business.id, { schedule: JSON.stringify(schedule) });

    // The response from edit business Ordering Co does not return today so I need to set it from schedule
    response.today = response.schedule[numberOfToday];
    return plainToClass(BusinessDto, response);
  }

  async getBusinessById(userId: number, publicBusinessId: string) {
    const business = await this.getOrderingBusiness(userId, publicBusinessId);
    return plainToClass(BusinessDto, business);
  }

  async getBusinessTodayScheduleById(userId: number, publicBusinessId: string) {
    const business = await this.getOrderingBusiness(userId, publicBusinessId);
    return { today: business.today, timezone: business.timezone };
  }

  async updateBusinessOwners(businsessData: any, orderingUserId: number) {
    return await this.prisma.business.update({
      where: {
        orderingBusinessId: businsessData.id,
      },
      data: {
        owners: {
          connect: {
            orderingUserId
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

  async findBusinessByOrderingId(orderingBusinessId: number) {
    const business = await this.prisma.business.findUnique({
      where: {
        orderingBusinessId
      },
      include: {
        owners: true,
      },
    });
    return business;
  }

  async findAllBusiness<S extends Prisma.BusinessSelect>(
    orderingUserId: number,
    select: S
  ): Promise<
    Prisma.BusinessGetPayload<{ select: S }>[]
  > {
    return await this.prisma.business.findMany({
      where: {
        owners: {
          some: {
            orderingUserId: orderingUserId,
          },
        },
      },
      select
    });
  }
}
