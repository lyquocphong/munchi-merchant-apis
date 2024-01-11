import { QueueService } from './../queue/queue.service';
import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { BusinessDto, BusinessExtraConfigDto } from './dto/business.dto';
import { UserService } from 'src/user/user.service';
import moment from 'moment-timezone';
import { BusinessExtraSetting, Prisma } from '@prisma/client';

import { BusinessInfoSelectBase } from './business.type';
import { OrderingBusiness } from 'src/provider/ordering/ordering.type';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Business } from 'ordering-api-sdk';

@Injectable()
export class BusinessService {
  constructor(
    private utils: UtilsService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => QueueService)) private queueService: QueueService,
    @Inject(forwardRef(() => OrderingService)) private orderingService: OrderingService,
  ) {}
  async createBusiness(businsessData: any, orderingUserId: number) {
    return await this.prismaService.business.create({
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
        logo: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncBusinessFromOrdering() {
    const orderingApiKey = await this.prismaService.apiKey.findFirst({
      where: {
        name: 'ORDERING_API_KEY',
      },
    });

    if (!orderingApiKey) {
      throw new NotFoundException('No key found');
    }

    const orderingBusiness = await this.orderingService.getAllBusinessForAdmin(
      orderingApiKey.value,
    );

    const formattedBusinessesData = plainToInstance(BusinessDto, orderingBusiness);

    await this.saveMultipleBusinessToDb(formattedBusinessesData);

    console.log('Success on sync businesses');
  }

  async getAllBusiness(page: number, rowPerPage: number) {
    const businessSelectArgs = Prisma.validator<Prisma.BusinessSelect>()({
      publicId: true,
      name: true,
      owners: {
        select: {
          publicId: true,
          level: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      logo: true,
      email: true,
      phone: true,
      address: true,
      description: true,
      businessExtraSetting: {
        select: {
          name: true,
          value: true,
        },
      },
    });

    const totalBusiness = await this.prismaService.business.count();

    const business = await this.findAllBusiness(businessSelectArgs, page, rowPerPage);

    return {
      data: business,
      total: totalBusiness,
    };
  }

  async upsertBusinessFromOrderingInfo<S extends Prisma.BusinessSelect>(
    businessInfo: OrderingBusiness,
    select: S,
  ): Promise<Prisma.BusinessGetPayload<{ select: S }>> {
    const data = Prisma.validator<Prisma.BusinessUncheckedCreateInput>()({
      name: businessInfo.name,
      logo: businessInfo.logo,
      orderingBusinessId: businessInfo.id.toString(),
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      description: businessInfo.description,
    });

    return await this.prismaService.business.upsert({
      where: {
        orderingBusinessId: businessInfo.id.toString(),
      },
      create: data,
      update: data,
      select,
    });
  }

  async businessOwnershipService(orderingId: number): Promise<BusinessDto[]> {
    const accessToken = await this.utils.getOrderingAccessToken(orderingId);
    const response = await this.orderingService.getAllBusiness(accessToken);
    const mappedBusiness = plainToInstance(OrderingBusiness, response);
    const user = await this.userService.getUserInternally(orderingId, null);

    if (!user) {
      throw new ForbiddenException('Something wrong happend');
    }

    // Need to update each business into our db
    const selectInfo = { ...BusinessInfoSelectBase, owners: true };
    const businessDtos: BusinessDto[] = [];
    for (const business of mappedBusiness) {
      const existedBusiness = await this.upsertBusinessFromOrderingInfo(business, selectInfo);
      const owner = existedBusiness.owners.filter(
        (owner) => owner.orderingUserId === user.orderingUserId,
      );
      // If no ownership then add and update it to business
      if (owner.length < 1) {
        await this.updateBusinessOwners(business, user.orderingUserId);
      }

      // TODO: Need to remove if owner has been remove

      const convertData = { ...business, id: existedBusiness.publicId };
  
      businessDtos.push(plainToInstance(BusinessDto, convertData));
    }

    return businessDtos;
  }

  async getOrderingBusiness(orderingUserId: number, publicBusinessId: string) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);
    const business = await this.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException(`we need this: ${publicBusinessId}`);
    }
    return await this.orderingService.getBusinessById(
      accessToken,
      business.orderingBusinessId.toString(),
    );
  }

  /**
   * This function is used to set status for today on or off
   *
   * This is used to set business is closed or not
   *
   * TODO: Now only handle for Munchi, maybe later need to do for Wolt and other
   *
   * @param orderingUserId
   * @param businessPublicId
   * @param status
   * @returns
   */
  async setOnlineStatusByPublicId(
    userPublicId: string,
    businessPublicId: string,
    status: boolean,
    duration: number = undefined,
  ) {
    const user = await this.userService.getUserByPublicId(userPublicId);
    const business = await this.getOrderingBusiness(user.orderingUserId, businessPublicId);

    if (!business) {
      throw new NotFoundException('Cannot find business to set today schedule');
    }

    const { schedule, timezone } = business;
    const numberOfToday = moment().tz(timezone).weekday();
    schedule[numberOfToday].enabled = status;
    const accessToken = await this.utils.getOrderingAccessToken(user.orderingUserId);
    const response = await this.orderingService.editBusiness(accessToken, business.id, {
      schedule: JSON.stringify(schedule),
    });

    // The response from edit business Ordering Co does not return today so I need to set it from schedule
    response.today = response.schedule[numberOfToday];

    if (status === false) {
      if (!duration) {
        throw new BadRequestException('duration is required when set status is false');
      }

      const time = moment.utc().add(duration, 'minutes').toDate();

      this.queueService.upsertActiveStatusQueue({
        provider: 'munchi',
        businessPublicId,
        userPublicId,
        time,
      });
    } else {
      this.queueService.removeActiveStatusQueue(businessPublicId);
    }

    return plainToInstance(BusinessDto, response);
  }

  async getBusinessById(userId: number, publicBusinessId: string) {
    const business = await this.getOrderingBusiness(userId, publicBusinessId);
    return plainToInstance(BusinessDto, business);
  }

  async getBusinessTodayScheduleById(orderingUserId: number, publicBusinessId: string) {
    const business = await this.getOrderingBusiness(orderingUserId, publicBusinessId);
    return { today: business.today, timezone: business.timezone, name: business.name };
  }

  async updateBusinessOwners(businsessData: any, orderingUserId: number) {
    return await this.prismaService.business.update({
      where: {
        orderingBusinessId: businsessData.id,
      },
      data: {
        owners: {
          connect: {
            orderingUserId,
          },
        },
      },
    });
  }

  async findBusinessByPublicId(publicBusinessId: string) {
    return await this.prismaService.business.findUnique({
      where: {
        publicId: publicBusinessId,
      },
      include: {
        businessExtraSetting: true,
      },
    });
  }

  async findBusinessByOrderingId<P extends Prisma.BusinessArgs>(
    orderingBusinessId: string,
    getPayload: P,
  ): Promise<Prisma.BusinessGetPayload<P>> {
    const options = {
      where: {
        orderingBusinessId,
      },
      ...getPayload,
    };

    return (await this.prismaService.business.findUnique(options)) as Prisma.BusinessGetPayload<P>;
  }

  async findBusinessByWoltVenueid(woltVenueId: string) {
    return await this.prismaService.businessExtraSetting.findUnique({
      where: {
        value: woltVenueId,
      },
      include: {
        business: true,
      },
    });
  }

  async getAssociateSessions(condition: Prisma.BusinessWhereInput): Promise<
    Prisma.BusinessGetPayload<{
      include: { sessions: true };
    }>[]
  > {
    return await this.prismaService.business.findMany({
      where: condition,
      include: { sessions: true },
    });
  }

  async findAllBusiness<S extends Prisma.BusinessSelect>(
    select: S,
    page: number,
    rowPerPage: number,
  ): Promise<Prisma.BusinessGetPayload<{ select: S }>[]> {
    return await this.prismaService.business.findMany({
      select,
      orderBy: {
        id: 'asc',
      },
      skip: page === 1 ? 0 : rowPerPage * (page - 1),
      take: rowPerPage,
    });
  }

  async addBusinessExtraSetting(
    businessPublicId: string,
    data: Omit<BusinessExtraConfigDto, 'id'>,
  ) {
    const business = await this.findBusinessByPublicId(businessPublicId);
    if (!business) {
      throw new NotFoundException("Business can't be found");
    }
    const dataUpsert = Prisma.validator<Prisma.BusinessExtraSettingUncheckedCreateInput>()({
      name: data.name,
      value: data.value,
      orderingBusinessId: business.orderingBusinessId,
    });

    return await this.prismaService.businessExtraSetting.upsert({
      where: {
        orderingBusinessId: business.orderingBusinessId,
      },
      create: dataUpsert,
      update: dataUpsert,
    });
  }

  async saveMultipleBusinessToDb(businesses: BusinessDto[]) {
    const businessesData = businesses.map((business: BusinessDto) => ({
      name: business.name,
      orderingBusinessId: business.id.toString(),
      address: business.address,
      description: business.description,
      email: business.email,
      logo: business.logo,
      phone: business.phone,
    }));
    await this.prismaService.business.createMany({
      data: businessesData,
      skipDuplicates: true,
    });
  }

  async findManyBusinessesByPublicId(businessPublicIds: string[]) {
    return await this.prismaService.business.findMany({
      where: {
        publicId: {
          in: businessPublicIds,
        },
      },
    });
  }
}
