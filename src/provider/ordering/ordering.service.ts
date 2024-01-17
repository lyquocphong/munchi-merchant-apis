import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { Business, Order } from 'ordering-api-sdk';
import { OfferDto } from 'src/order/dto/offer.dto';
import {
  AvailableOrderStatus,
  OrderDto,
  OrderResponse,
  OrderStatusEnum,
} from 'src/order/dto/order.dto';
import { ProductDto } from 'src/order/dto/product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthCredentials, OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { ProviderService } from '../provider.service';
import { ProviderEnum } from '../provider.type';
import {
  OrderingDeliveryType,
  OrderingOrder,
  OrderingOrderStatus,
  OrderingUser,
  completedStatus,
  deliveredStatus,
  inProgressStatus,
  pendingStatus,
  rejectedStatus,
} from './ordering.type';
import { WoltOrderType } from '../wolt/wolt.type';
import moment from 'moment';

@Injectable()
export class OrderingService implements ProviderService {
  private readonly logger = new Logger(OrderingService.name);

  constructor(private utilService: UtilsService, private readonly prismaService: PrismaService) {}
  getAllOrder(accessToken: string, id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getOrderByStatus(
    accessToken: string,
    status: string,
    businessOrderingIds: string[],
  ): Promise<OrderingOrder[]> {
    const businessOrderingIdsString = businessOrderingIds.join(',');

    const paramsQuery = [
      'id',
      'business_id',
      'prepared_in',
      'customer_id',
      'status',
      'delivery_type',
      'delivery_datetime',
      'products',
      'summary',
      'customer',
      'created_at',
      'spot_number',
      'history',
      'delivery_datetime',
      'business',
      'reporting_data',
      'comment',
      'offers',
      'paymethod_id',
    ].join(',');
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl(
        'orders',
      )}?mode=dashboard&where={"status":[${status}],"business_id":[${businessOrderingIdsString}]}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async getOrderById(accessToken: string, orderId: string): Promise<OrderingOrder> {
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl('orders', orderId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  // Auth service
  async signIn(credentials: AuthCredentials): Promise<OrderingUser> {
    const options = {
      method: 'POST',
      url: this.utilService.getEnvUrl('auth'),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        email: credentials.email,
        password: credentials.password,
      },
    };

    try {
      const response = await axios.request(options);
      return plainToInstance(OrderingUser, response.data.result);
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async signOut(accessToken: string) {
    const options = {
      method: 'POST',
      url: this.utilService.getEnvUrl('auth', 'logout'),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  //business services
  async getAllBusiness(accessToken: string): Promise<Business[]> {
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl(
        'business',
      )}?type=1&params=name,email,phone,address,logo,metafields,description,today,schedule,owners,enabled&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async getAllBusinessForAdmin(apiKey: string): Promise<Business[]> {
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl(
        'business',
      )}?type=1&params=name,email,phone,address,logo,metafields,description,today,schedule,owners,enabled&mode=dashboard`,
      headers: {
        accept: 'application/json',
        'x-api-key': apiKey,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async getBusinessById(accessToken: string, businessId: string) {
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl('business', businessId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);

      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async editBusiness(accessToken: string, businessId: number, data: object): Promise<Business> {
    const options = {
      method: 'POST',
      url: `${this.utilService.getEnvUrl('business', businessId)}`,
      data,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    this.logger.warn('edit business', options.url, data);

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async getOrderForBusinesses(
    accessToken: string,
    businessIds: string[],
    query: string,
    paramsQuery: string[],
  ) {
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl(
        'orders',
      )}?mode=dashboard&where={${query},"business_id":[${businessIds}]}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async getFilteredOrders(
    accessToken: string,
    businessId: string,
    query: string,
    paramsQuery: string[],
  ) {
    const options = {
      method: 'GET',
      url: `${this.utilService.getEnvUrl(
        'orders',
      )}?mode=dashboard&where={${query},"business_id":${businessId}}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async getUserKey(accessToken: string, userId: number) {
    const options = {
      method: 'GET',
      url: `https://apiv4.ordering.co/v400/language/peperoni/users/${userId}/keys
      `,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async updateOrder(
    accessToken: string,
    orderId: string,
    orderData: Omit<OrderData, 'provider'>,
  ): Promise<OrderingOrder> {
    const orderingOrder = await this.getOrderById(accessToken, orderId);
    const defaultStatus = {
      pending: OrderingOrderStatus.Pending,
      in_progress: OrderingOrderStatus.AcceptedByBusiness,
      completed: OrderingOrderStatus.PreparationCompleted,
      delivered:
        orderingOrder.status === OrderingDeliveryType.Delivery
          ? OrderingOrderStatus.PickUpCompletedByDriver
          : OrderingOrderStatus.PickupCompletedByCustomer,
    };

    const status = defaultStatus[orderData.orderStatus];

    const options = {
      method: 'PUT',
      url: `${this.utilService.getEnvUrl('orders', orderId)}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        status: status,
        prepared_in: orderData.preparedIn,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async rejectOrder(accessToken: string, orderId: string): Promise<OrderingOrder> {
    const options = {
      method: 'PUT',
      url: `${this.utilService.getEnvUrl('orders', orderId)}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        status: OrderingOrderStatus.RejectedByBusiness,
      },
    };
    console.log('🚀 ~ OrderingService ~ rejectOrder ~ options:', options);

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  async deleteOrder(accessToken: string, orderId: number) {
    const options = {
      method: 'DELETE',
      url: `${this.utilService.getEnvUrl('orders', orderId)}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  //User service
  async getUser(accessToken: string, userId: number) {
    const options = {
      method: 'GET',
      url: this.utilService.getEnvUrl('users', userId),
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  //Page
  async getPage(accessToken: string) {
    const options = {
      method: 'GET',
      url: this.utilService.getEnvUrl('pages'),
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  /**
   * Set schedule for business
   *
   * @param accessToken
   * @param schedule    Json string of schedule
   * @returns
   */
  async setBusinessSchedule(accessToken: string, schedule: string) {
    const options = {
      method: 'GET',
      url: this.utilService.getEnvUrl('pages'),
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utilService.logError(error);
    }
  }

  //Transform ordering response to order resposne
  async mapOrderToOrderResponse(orderingOrder: OrderingOrder): Promise<OrderResponse> {
    const preorder: boolean = orderingOrder.reporting_data.at.hasOwnProperty(`status:13`);
    const productDto = plainToInstance(ProductDto, orderingOrder.products);
    const offers = plainToInstance(OfferDto, orderingOrder.offers);
    const orderStatus = this.mapOrderingStatusToOrderStatus(orderingOrder.status) as string;
    const business = await this.validateOrderingBusiness(orderingOrder.business_id.toString());

    //Calculate total amount without delivery fee and including the discount
    const total =
      orderingOrder.summary.total -
      orderingOrder.summary.delivery_price -
      orderingOrder.summary.driver_tip;
    const lastModified =
      orderingOrder.history.length === 0
        ? null
        : this.utilService.convertTimeToTimeZone(
            moment(
              orderingOrder.history[orderingOrder.history.length - 1].updated_at,
            ).toISOString(),
            business.timeZone,
          );

    const deliveryDatetime = orderingOrder.delivery_datetime
      ? this.utilService.convertTimeToTimeZone(
          moment(orderingOrder.delivery_datetime).toISOString(),
          business.timeZone,
        )
      : null;
    const createdAt = orderingOrder.created_at
      ? this.utilService.convertTimeToTimeZone(
          moment(orderingOrder.created_at).toISOString(),
          business.timeZone,
        )
      : null;
    return {
      id: orderingOrder.id.toString(),
      business: {
        orderingBusinessId: business.orderingBusinessId,
        logo: business.logo,
        name: business.name,
        publicId: business.publicId,
        address: business.address,
        email: business.email,
      },
      table: orderingOrder.spot_number,
      payMethodId: orderingOrder.paymethod_id,
      type: preorder ? WoltOrderType.PreOrder : WoltOrderType.Instant,
      deliveryType: orderingOrder.delivery_type,
      comment: orderingOrder.comment,
      summary: {
        total: total.toString(), // This should be equal to subtotal as we don't need delivery fee
      },
      customer: {
        name: `${orderingOrder.customer.name} ${orderingOrder.customer.lastname}`,
        phone: orderingOrder.customer.cellphone,
      },
      deliveryEta: deliveryDatetime,
      pickupEta: null,
      lastModified: lastModified,
      provider: ProviderEnum.Munchi,
      status: orderStatus,
      createdAt: createdAt,
      prepareIn: orderingOrder.prepared_in,
      preorder: preorder
        ? {
            status: 'waiting',
            preorderTime: deliveryDatetime,
          }
        : null,
      products: productDto,
      offers: offers,
    };
  }

  async validateOrderingBusiness(orderingBusinessId: string) {
    const business = await this.prismaService.business.findUnique({
      where: {
        orderingBusinessId: orderingBusinessId,
      },
    });
    if (!business) {
      throw new NotFoundException('No business found');
    }

    return business;
  }

  mapOrderingStatusToOrderStatus(
    orderingStatus?: number,
    orderStatus?: AvailableOrderStatus,
  ): string | number[] {
    if (orderingStatus !== undefined) {
      if (pendingStatus.includes(orderingStatus)) {
        return OrderStatusEnum.PENDING as string;
      } else if (inProgressStatus.includes(orderingStatus)) {
        return OrderStatusEnum.IN_PROGRESS as string;
      } else if (completedStatus.includes(orderingStatus)) {
        return OrderStatusEnum.COMPLETED as string;
      } else if (deliveredStatus.includes(orderingStatus)) {
        return OrderStatusEnum.COMPLETED as string;
      } else {
        return OrderStatusEnum.REJECTED as string;
      }
    }

    if (orderStatus !== undefined) {
      switch (orderStatus) {
        case OrderStatusEnum.PENDING:
          return pendingStatus as number[];
        case OrderStatusEnum.IN_PROGRESS:
          return inProgressStatus as number[];
        case OrderStatusEnum.COMPLETED:
          return completedStatus as number[];
        case OrderStatusEnum.DELIVERED:
          return deliveredStatus as number[];
        default:
          return rejectedStatus as number[];
      }
    }
  }
}
