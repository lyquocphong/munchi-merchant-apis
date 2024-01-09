import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { SessionService } from 'src/auth/session.service';
import { BusinessService } from 'src/business/business.service';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { OrderingOrderStatus } from 'src/provider/ordering/ordering.type';
import { AvailableProvider, ProviderEnum } from 'src/provider/provider.type';
import { WoltOrder } from 'src/provider/wolt/wolt.type';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { AvailableOrderStatus, OrderDto, OrderResponse, OrderStatusEnum } from './dto/order.dto';
import { WoltService } from 'src/provider/wolt/wolt.service';
import { ProviderManagmentService } from 'src/provider/provider-management.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderingService: OrderingService,
    private readonly providerManagementService: ProviderManagmentService,
    private readonly woltService: WoltService,
    private readonly utils: UtilsService,
    private readonly businessService: BusinessService,
    private readonly sessionService: SessionService,
  ) {}

  async getFilteredOrdersForSession(
    sessionPublicId: string,
    query: string,
    paramsQuery: string[],
    businessPublicId?: string[],
  ) {
    // TODO: Create general type instead of create seperately
    const findSessionArgs = Prisma.validator<Prisma.SessionFindFirstArgsBase>()({
      select: {
        id: true,
        refreshToken: true,
        deviceId: true,
        businesses: {
          select: {
            id: true,
            publicId: true,
            orderingBusinessId: true,
          },
        },
        user: {
          select: {
            id: true,
            orderingUserId: true,
            publicId: true,
            email: true,
            businesses: true,
            orderingAccessToken: true,
          },
        },
      },
    });

    const session = await this.sessionService.getSessionByPublicId<
      Prisma.SessionGetPayload<typeof findSessionArgs>
    >(sessionPublicId, findSessionArgs);
    if (!session) {
      throw new NotFoundException('Cannot find session by public Id');
    }

    // TODO: Need to take from controller, now hardcode to use from session
    const businessIds = session.businesses.map((business) => business.orderingBusinessId);
    const { user } = session;

    try {
      const response = await this.orderingService.getOrderForBusinesses(
        user.orderingAccessToken,
        businessIds,
        query,
        paramsQuery,
      );
      return plainToInstance(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrderByStatus(
    orderingUserId: number,
    bodyData: {
      providers: string[];
      status: AvailableOrderStatus;
      businessPublicIds: string[];
    },
  ) {
    if (!bodyData || Object.values(bodyData).some((value) => value === null)) {
      throw new NotFoundException('Not enough data');
    }

    //Validate data from body
    const validProvider = await this.providerManagementService.validateProvider(bodyData.providers);
    const validateStatus = await this.validateOrderStatus(bodyData.status);

    // If not enough data or data passed in wrong we return error
    if (!validProvider) {
      throw new NotFoundException('Provider not found');
    } else if (!validateStatus) {
      throw new NotFoundException('Status not found');
    }

    const businesses = await this.businessService.findManyBusinessesByPublicId(
      bodyData.businessPublicIds,
    );

    //Format business data to array of business ordering ids
    const businessIds = businesses.map((b) => b.orderingBusinessId);

    // console.log('🚀 ~ OrderService ~ validProvider:', validProvider);

    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);

    // Get order by filtering provider, status and businessIds
    const order = await this.providerManagementService.getOrderByStatus(
      bodyData.providers,
      bodyData.status,
      businessIds,
      {
        orderingToken: accessToken,
      },
    );
    return order;
  }

  // TODO: Need to refactor later
  async getFilteredOrdersForBusiness(
    userId: number,
    query: string,
    paramsQuery: string[],
    publicBusinessId: string,
  ) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    const business = await this.businessService.findBusinessByPublicId(publicBusinessId);

    if (!business) {
      throw new ForbiddenException('Something wrong happened');
    }
    try {
      const response = await this.orderingService.getFilteredOrders(
        accessToken,
        business.orderingBusinessId,
        query,
        paramsQuery,
      );
      return plainToInstance(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrderbyId(orderingUserId: number, orderId: string) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);
    try {
      const response = await this.orderingService.getOrderById(accessToken, orderId);
      return plainToInstance(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async postOrderbyId(
    orderingUserId: number,
    orderData: { orderId: string; provider: AvailableProvider },
  ) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);
    try {
      return await this.providerManagementService.getOrderById(
        orderData.orderId,
        orderData.provider,
        {
          orderingToken: accessToken,
        },
      );
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async updateOrder(orderingUserId: number, orderId: string, orderData: OrderData) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);

    if (!orderData || Object.values(orderData).some((value) => value === null)) {
      throw new NotFoundException('Not enough data');
    }

    const validProvider = await this.providerManagementService.validateProvider(orderData.provider);

    if (!validProvider) {
      throw new NotFoundException('No provider found');
    }

    try {
      //Update order base on provider
      await this.providerManagementService.updateOrder(
        orderData.provider,
        orderId,
        {
          orderStatus: orderData.orderStatus,
          preparedIn: orderData.preparedIn,
        },
        {
          orderingToken: accessToken,
        },
      );
      // const response = await this.orderingService.updateOrder(accessToken, orderId, orderData);
      // return plainToInstance(OrderDto, response);
      return 'Updated';
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async deleteOrder(orderingUserId: number, orderId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);
    try {
      const response = await this.orderingService.deleteOrder(accessToken, orderId);
      return response;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async validateOrderStatus(orderStatus: string) {
    const orderStatusArray: string[] = Object.values(OrderStatusEnum);

    if (orderStatusArray.includes(orderStatus)) {
      return true;
    }
    return false;
  }
}
