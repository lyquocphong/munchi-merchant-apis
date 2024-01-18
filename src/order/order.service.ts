import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { SessionService } from 'src/auth/session.service';
import { BusinessService } from 'src/business/business.service';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { ProviderManagmentService } from 'src/provider/provider-management.service';
import { AvailableProvider } from 'src/provider/provider.type';
import { WoltService } from 'src/provider/wolt/wolt.service';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { AvailableOrderStatus, OrderDto, OrderStatusEnum } from './dto/order.dto';
import { OrderRejectData } from './validation/order.validation';

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
    queryData: {
      providers: string[];
      status: AvailableOrderStatus[];
      businessPublicIds: string[];
    },
  ) {
    const validProvider = await this.providerManagementService.validateProvider(
      queryData.providers,
    );
    const validateStatus = await this.validateOrderStatus(queryData.status);
    // If not enough data or data passed in wrong we return error
    if (!validProvider) {
      throw new NotFoundException('Provider not found');
    } else if (!validateStatus) {
      throw new NotFoundException('Status not found');
    }

    const businesses = await this.businessService.findManyBusinessesByPublicId(
      queryData.businessPublicIds,
    );

    //Format business data to array of business ordering ids
    const businessIds = businesses.map((b) => b.orderingBusinessId);

    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);

    // Get order by filtering provider, status and businessIds
    const order = await this.providerManagementService.getOrderByStatus(
      queryData.providers,
      queryData.status,
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
      return await this.providerManagementService.getOrderById(orderId, {
        orderingToken: accessToken,
      });
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
      const order = await this.providerManagementService.updateOrder(
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

      return order;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async rejectOrder(orderingUserId: number, orderId: string, orderRejectData: OrderRejectData) {
    const accessToken = await this.utils.getOrderingAccessToken(orderingUserId);

    try {
      return await this.providerManagementService.rejectOrder(
        orderRejectData.provider,
        orderId,
        {
          reason: orderRejectData.reason,
        },
        {
          orderingToken: accessToken,
        },
      );
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

  async validateOrderStatus(orderStatus: AvailableOrderStatus[]) {
    const orderStatusArray: string[] = Object.values(OrderStatusEnum);

    return orderStatus.every((element) => orderStatusArray.includes(element));
  }
}
