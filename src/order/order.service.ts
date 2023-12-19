import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { UtilsService } from 'src/utils/utils.service';
import { OrderDto, OrderResponse } from './dto/order.dto';
import { BusinessService } from 'src/business/business.service';
import { OrderData } from 'src/type';
import { Prisma } from '@prisma/client';
import { SessionService } from 'src/auth/session.service';
import { Order } from 'ordering-api-sdk';
import { WoltOrder } from 'src/provider/wolt/wolt.type';
import { ProviderEnum } from 'src/provider/provider.type';

@Injectable()
export class OrderService {
  constructor(
    private readonly Ordering: OrderingService,
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
      const response = await this.Ordering.getOrderForBusinesses(
        user.orderingAccessToken,
        businessIds,
        query,
        paramsQuery,
      );

      return plainToInstance(OrderDto, response);

      //TODO: Need to  get order from wolt here

      //TODO: merge 2 order with each other and return
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
    const business = await this.businessService.findBusinessByPublicId(publicBusinessId);

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

  //Transform ordering response to order resposne
  async mapOrderingOrderToOrderResponse(
    orderingOrder: any,
    businessOrderingId: number,
  ): Promise<OrderResponse> {
    const business = await this.businessService.findBusinessByOrderingId(businessOrderingId, {});

    const preorder: boolean = orderingOrder.reporting_data.at.hasOwnProperty(`status:13`);

    return {
      id: orderingOrder.id,
      business: {
        logo: business.logo,
        name: business.name,
        publicId: business.publicId,
        address: business.address,
        email: business.email,
      },
      deliveryType: orderingOrder.delivery_type,
      comment: orderingOrder.comment,
      summary: {
        deliveryPrice: orderingOrder.delivery,
        subTotal: orderingOrder.subTotal,
      },
      provider: ProviderEnum.Munchi,
      status: orderingOrder.status,
      createdAt: orderingOrder.created_at,
      preorder: {
        status: preorder ? 'confirmed' : 'waiting',
        preorderTime: orderingOrder.delivery_datetime,
      },
      products: orderingOrder.products,
    };
  }

  async mapWoltOrderToOrderResponse(woltOrder: WoltOrder,  businessOrderingId: number,): Promise<OrderResponse> {
    
    const business = await this.businessService.findBusinessByOrderingId(businessOrderingId, {});
    
    let deliverytype:number;

    woltOrder.delivery.type === 'eatin' ? deliverytype = 3 :   woltOrder.delivery.type === 'homedelivery' ? deliverytype = 1 : deliverytype = 2

    return {
    //   id: woltOrder.id,
    //   business: {
    //     logo: business.logo,
    //     name: business.name,
    //     publicId: business.publicId,
    //     address: business.address,
    //     email: business.email,
    //   },
    //   deliveryType: deliverytype,
    //   comment: woltOrder.consumer_comment,
    //   summary: {
    //     deliveryPrice: woltOrder.delivery.fee.amount,
    //     subTotal: woltOrder.price.amount,
    //   },
    //   provider: ProviderEnum.Wolt,
    //   status: woltOrder.order_status,
    //   createdAt: woltOrder.created_at,
    //   preorder: {
    //     status: woltOrder.pre_order.pre_order_status ,
    //     preorderTime: woltOrder.pre_order.preorder_time,
    //   },
    //   products: woltOrder.items,
    // };
    };
  }
}
