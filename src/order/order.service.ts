import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { OrderingService } from 'src/provider/ordering.service';
import { UtilsService } from 'src/utils/utils.service';
import { OrderDto } from './dto/order.dto';
import { BusinessService } from 'src/business/business.service';
import { OrderData } from 'src/type';
import { Prisma } from '@prisma/client';
import { SessionService } from 'src/auth/session.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly Ordering: OrderingService,
    private readonly utils: UtilsService,
    private readonly business: BusinessService,
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
      const response = await this.Ordering.getOrderForBusinesses(
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

  // TODO: Need to refactor later
  async getFilteredOrdersForBusiness(
    userId: number,
    query: string,
    paramsQuery: string[],
    publicBusinessId: string,
  ) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    const business = await this.business.findBusinessByPublicId(publicBusinessId);

    if (!business) {
      throw new ForbiddenException('Something wrong happened');
    }
    try {
      const response = await this.Ordering.getFilteredOrders(
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

  async getOrderbyId(userId: number, orderId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    try {
      const response = await this.Ordering.getOrderbyId(accessToken, orderId);
      return plainToInstance(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async updateOrder(userId: number, orderId: number, orderData: OrderData) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    try {
      const response = await this.Ordering.updateOrder(accessToken, orderId, orderData);
      return plainToInstance(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async deleteOrder(userId: number, orderId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    try {
      const response = await this.Ordering.deleteOrder(accessToken, orderId);
      return response;
    } catch (error) {
      this.utils.logError(error);
    }
  }
}
