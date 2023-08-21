/* eslint-disable prettier/prettier */
import { Injectable, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { BusinessDto } from './dto/business.dto';
import { UserService } from 'src/user/user.service';
import moment from 'moment-timezone';

@Injectable()
export class BusinessService {
  constructor(
    private utils: UtilsService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => OrderingIoService)) private orderingIo: OrderingIoService,
  ) {}
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

  async getAllBusiness(orderingId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingId);
    const response = await this.orderingIo.getAllBusiness(accessToken);
    const user = await this.userService.getUserInternally(orderingId, null);

    if (!user) {
      throw new ForbiddenException('Something wrong happend');
    }

    for (const business of response) {
      const existedBusiness = await this.findBusinessByOrderingId(business.id);

      if (existedBusiness) {
        // Check ownership of the new user with existed business
        const owner = existedBusiness.owners.filter((owner) => owner.orderingUserId === user.orderingUserId);
        // If no ownership then add and update it to business
        if (owner.length < 1) {
          await this.updateBusinessOwners(business, user.orderingUserId);
        } else {
          return await this.findAllBusiness(user.orderingUserId);
        }
      } else {
        await this.createBusiness(business, user.orderingUserId);
      }
    }

    return await this.findAllBusiness(user.orderingUserId);
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
  async setTodayScheduleStatus(userId: number, publicId: string ,status: boolean) {
    const business = await this.getOrderingBusiness(userId, publicId);
    const {schedule} = business;
    const numberOfToday = moment().weekday();
    schedule[numberOfToday].enabled = status;
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    const response = await this.orderingIo.editBusiness(accessToken, business.id, {schedule: JSON.stringify(schedule)});

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
    return {today: business.today, timezone: business.timezone};
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

  async findAllBusiness(orderingUserId: number) {
    return await this.prisma.business.findMany({
      where: {
        owners: {
          some: {
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
}
