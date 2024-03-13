import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ProviderCredential } from '@prisma/client';
import axios from 'axios';
import moment from 'moment';
import {
  AvailableOrderStatus,
  OrderResponse,
  OrderResponsePreOrderStatusEnum,
  OrderStatusEnum,
} from 'src/order/dto/order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { OrderingDeliveryType } from '../ordering/ordering.type';
import { ProviderService } from '../provider.service';
import { ProviderEnum } from '../provider.type';
import { WoltMenuData } from './dto/wolt-menu.dto';
import {
  WoltOrder,
  WoltOrderPrismaSelectArgs,
  WoltOrderType
} from './dto/wolt-order.dto';
import { WoltOrderMapperService } from './wolt-order-mapper';
import { WoltRepositoryService } from './wolt-repository';
import { WoltSyncService } from './wolt-sync';

@Injectable()
export class WoltService implements ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private woltApiUrl: string;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private utilsService: UtilsService,
    private woltOrderMapperService: WoltOrderMapperService,
    private woltRepositoryService: WoltRepositoryService,
    private woltSyncService: WoltSyncService,
  ) {
    this.woltApiUrl = this.configService.get('WOLT_API_URL');
  }

  async getOrderByStatus(
    accessToken: string,
    status: AvailableOrderStatus[],
    businessIds: string[],
    orderBy?: Prisma.OrderOrderByWithRelationInput,
  ): Promise<any[]> {
    const orders = await this.prismaService.order.findMany({
      where: {
        status: {
          in: status,
        },
        provider: ProviderEnum.Wolt,
        orderingBusinessId: {
          in: businessIds,
        },
      },
      orderBy: orderBy,
      include: WoltOrderPrismaSelectArgs,
    });

    return orders;
  }

  async getWoltCredentials(
    keyLookupValue: string | number,
    lookupType: 'orderingUserId' | 'venueId',
  ) {
    let woltCredentals: ProviderCredential; // API Keys are typically strings

    if (lookupType === 'orderingUserId' && typeof keyLookupValue === 'number') {
      woltCredentals = await this.getApiKeyByOrderingUserId(keyLookupValue);
    } else if (lookupType === 'venueId' && typeof keyLookupValue === 'string') {
      woltCredentals = await this.getApiKeyByVenueId(keyLookupValue);
    } else {
      throw new Error('Invalid lookupType or  keyLookupValue type provided');
    }

    return woltCredentals;
  }

  async getApiKeyByOrderingUserId(orderingUserId: number): Promise<ProviderCredential> {
    const user = await this.prismaService.user.findUnique({
      where: {
        orderingUserId: orderingUserId,
      },
      include: {
        providerCredentials: true,
      },
    });

    if (!user.providerCredentialsId || !user.providerCredentials) {
      throw new NotFoundException('No provider found associated with user.');
    }

    return user.providerCredentials;
  }

  async getApiKeyByVenueId(venueId: string): Promise<ProviderCredential> {
    const provider = await this.prismaService.provider.findUnique({
      where: {
        providerId: venueId,
      },
      include: {
        business: {
          include: {
            owners: {
              include: {
                providerCredentials: true,
              },
            },
          },
        },
      },
    });

    const providerCredentialsId = provider.business.owners.map(
      (owner) => owner.providerCredentials.id,
    );

    const providerCredentials = await this.prismaService.providerCredential.findUnique({
      where: {
        id: providerCredentialsId[0],
      },
    });

    if (!providerCredentials) {
      throw new NotFoundException('No provider found associated with user.');
    }

    return providerCredentials;
  }

  /**
   * Asynchronously retrieves Wolt order data from the Wolt server.
   *
   * @param   {string<WoltOrder>}   woltOrdeId  Wolt order id
   *
   * @return  {Promise<WoltOrder>}              A promise that resolves with the Wolt order data from the Wolt server.
   */
  public async getOrderById(woltApiKey: string, woltOrdeId: string): Promise<WoltOrder> {
    try {
      const response = await axios.request({
        method: 'GET',
        baseURL: `${this.woltApiUrl}/orders/${woltOrdeId}`,
        headers: {
          'WOLT-API-KEY': woltApiKey,
        },
      });

      return response.data;
    } catch (error) {
      this.utilsService.logError(error);
    }
  }

  async sendWoltUpdateRequest(
    woltOrderId: string,
    endpoint: string,
    orderType: WoltOrderType,
    orderingUserId: number,
    updateData?: Omit<OrderData, 'provider'>,
  ) {
    const woltCredentals = await this.getWoltCredentials(orderingUserId, 'orderingUserId');

    const option = {
      method: 'PUT',
      baseURL: `${this.woltApiUrl}/orders/${woltOrderId}/${endpoint}`,
      headers: {
        'WOLT-API-KEY': woltCredentals.apiKey,
      },
      data:
        endpoint === 'reject'
          ? {
              reason: updateData.reason
                ? updateData.reason
                : 'Your order has been rejected, please contact the restaurant for more info',
            }
          : endpoint === 'accept' && orderType === WoltOrderType.Instant
          ? {
              adjusted_pickup_time: updateData.preparedIn,
            }
          : null,
    };
    try {
      const response = await axios.request(option);
      return response.data;
    } catch (error: any) {
      this.logger.log(
        `Error when updating wolt Order with order id:${woltOrderId}. Error: ${error}`,
      );

      await this.syncWoltOrder(woltCredentals.apiKey, woltOrderId);
      throw new ForbiddenException(error);
    }
  }

  /**
   * This service takes a Wolt order ID as input to update the corresponding order.
   * It follows the following steps:
   * 1. Retrieve the order details from the Wolt server using the provided order ID.
   * 2. Check if the retrieved order matches the current order in the local database and meets all conditions.
   * 3. If conditions are met, send a PUT request to the server to update the order.
   * 4. Sync the updated order data with the local database to maintain consistency.
   *
   * @param {string} woltOrderId - The Wolt order ID to identify the order to be updated.
   * @returns {Promise<void>} A promise that resolves when the update and synchronization process is complete.
   * @throws {Error} If any issues occur during the retrieval, validation, or update process.
   */
  public async updateOrder(
    orderingUserId: number,
    woltOrderId: string,
    { orderStatus, preparedIn }: Omit<OrderData, 'provider'>,
  ): Promise<any> {
    // Get wolt api ley from database
    const woltCredentials = await this.getWoltCredentials(orderingUserId, 'orderingUserId');

    const order = await this.woltRepositoryService.getOrderByIdFromDb(woltOrderId);

    const updateEndPoint = this.generateWoltUpdateEndPoint(orderStatus, order as any);

    if (order.status === OrderStatusEnum.DELIVERED) {
      return;
    }

    if (orderStatus === OrderStatusEnum.PICK_UP_COMPLETED_BY_DRIVER) {
      return this.updateAndReturn(order, null, orderStatus);
    }

    try {
      const adjustedPickupTime = preparedIn
        ? moment(order.createdAt).add(preparedIn, 'minutes').format()
        : order.pickupEta;

      await this.sendWoltUpdateRequest(
        order.orderId,
        updateEndPoint,
        order.type as WoltOrderType,
        orderingUserId,
        {
          orderStatus: OrderStatusEnum.IN_PROGRESS,
          preparedIn: adjustedPickupTime,
        },
      );

      if (
        order.deliveryType === OrderingDeliveryType.Delivery &&
        order.status === OrderStatusEnum.PENDING
      ) {
        const maxRetries = 10;
        const retryInterval = 500;
        const syncPickUpTime = await this.getOrderById(woltCredentials.apiKey, order.orderId);
        const formattedSyncOrder = await this.woltOrderMapperService.mapOrderToOrderResponse(
          syncPickUpTime,
        );

        const woltOrderMoment = moment(formattedSyncOrder.pickupEta);
        const formattedSyncOrderMoment = moment(order.pickupEta);
        let hasPickupTimeUpdated = false;
        for (let i = 0; i < maxRetries; i++) {
          if (!woltOrderMoment.isSame(formattedSyncOrderMoment, 'millisecond')) {
            hasPickupTimeUpdated = true;
          } else {
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
          }
        }

        if (hasPickupTimeUpdated) {
          await this.syncWoltOrder(woltCredentials.apiKey, order.orderId);
        }
      }

      return this.updateAndReturn(order, preparedIn, orderStatus);
    } catch (error) {
      this.logger.log(`Error when updating order: ${error}`);
      throw new ForbiddenException(error);
    }
  }

  private async updateAndReturn(
    order: any,
    preparedIn: string | null,
    orderStatus: AvailableOrderStatus,
  ): Promise<any> {
    const updatedOrder = await this.updateOrderInDatabase(order, preparedIn, orderStatus);
    return updatedOrder;
  }

  async updateOrderInDatabase(
    order: any,
    preparedIn?: string,
    orderStatus?: AvailableOrderStatus,
  ): Promise<any> {
    const updatedOrder = await this.prismaService.order.update({
      where: {
        orderId: order.orderId,
      },
      data: {
        preparedIn: preparedIn ?? order.preparedIn,
        status: orderStatus,
        preorder: order.preorder
          ? {
              update: {
                preorderTime: order.preorder.preorderTime,
                status: OrderResponsePreOrderStatusEnum.Confirm,
              },
            }
          : undefined,
        lastModified: moment().toISOString(true),
      },
      include: WoltOrderPrismaSelectArgs,
    });

    return updatedOrder;
  }

  public async rejectOrder(
    orderingUserId: number,
    orderId: string,
    orderRejectData: {
      reason: string;
    },
  ): Promise<any> {
    const order = await this.woltRepositoryService.getOrderByIdFromDb(orderId);

    await this.sendWoltUpdateRequest(
      order.orderId,
      'reject',
      order.type as WoltOrderType,
      orderingUserId,
      {
        reason: orderRejectData.reason,
        orderStatus: OrderStatusEnum.REJECTED,
        preparedIn: null,
      },
    );

    const updatedOrder = await this.prismaService.order.update({
      where: {
        orderId: order.orderId,
      },
      data: {
        status: OrderStatusEnum.REJECTED,
      },
      include: WoltOrderPrismaSelectArgs,
    });
    return updatedOrder;
  }

  async syncWoltOrder(woltApiKey: string, woltOrderId: string) {
    const woltOrder = await this.getOrderById(woltApiKey, woltOrderId);
    const mappedWoltOrder = await this.woltOrderMapperService.mapOrderToOrderResponse(woltOrder);

    const order = await this.prismaService.order.findUnique({
      where: {
        orderId: woltOrderId,
      },
    });

    if (
      order.status === OrderStatusEnum.PICK_UP_COMPLETED_BY_DRIVER &&
      mappedWoltOrder.status === OrderStatusEnum.COMPLETED
    ) {
      return;
    }

    await this.woltSyncService.syncWoltOrder(mappedWoltOrder);
  }

  async syncMenu(woltVenueId: string, orderingUserId: number, woltMenuData: WoltMenuData) {
    const woltCredentals = await this.getWoltCredentials(orderingUserId, 'orderingUserId');

    const option = {
      method: 'POST',
      baseURL: `${this.woltApiUrl}/v1/restaurants/${woltVenueId}/menu`,
      data: woltMenuData,
      headers: {
        Authorization: `Basic {{${woltCredentals.username}:${woltCredentals.password}}}`,
      },
    };

    try {
      const response = await axios.post(
        `${this.woltApiUrl}/v1/restaurants/${woltVenueId}/menu`,
        woltMenuData,
        {
          auth: {
            username: woltCredentals.username,
            password: woltCredentals.password,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.log(
        '🚀 ~ WoltService ~ syncMenu ~ error:',
        error.response ? error.response.data : error.message,
      );
      // await this.syncWoltBusiness(woltOrderId);
      throw new ForbiddenException(error.response ? error.response.data : error.message);
    }
  }

  async getWoltBusinessById(woltVenueId: string, orderingUserId: number) {
    const woltCredentals = await this.getWoltCredentials(orderingUserId, 'orderingUserId');

    const option = {
      method: 'GET',
      baseURL: `${this.woltApiUrl}/venues/${woltVenueId}/status`,
      headers: {
        'WOLT-API-KEY': woltCredentals.apiKey,
      },
    };
    try {
      const response = await axios.request(option);

      return response.data;
    } catch (error: any) {
      // await this.syncWoltBusiness(woltOrderId);
      throw new ForbiddenException(error);
    }
  }

  async setWoltVenueStatus(
    woltVenueId: string,
    orderingUserId: number,
    status: boolean,
    time?: string,
  ) {
    const woltCredentals = await this.getWoltCredentials(orderingUserId, 'orderingUserId');

    const option = {
      method: 'PATCH',
      baseURL: `${this.woltApiUrl}/venues/${woltVenueId}/online`,
      headers: {
        'WOLT-API-KEY': woltCredentals.apiKey,
      },
      data: {
        status: status ? 'ONLINE' : 'OFFLINE',
        until: time ? time : null,
      },
    };

    try {
      const response = await axios.request(option);

      return response.data;
    } catch (error: any) {
      // await this.syncWoltBusiness(woltOrderId);
      throw new ForbiddenException(error);
    }
  }

  generateWoltUpdateEndPoint(orderStatus: AvailableOrderStatus, woltOrderFromDb: OrderResponse) {
    if (orderStatus === OrderStatusEnum.PREORDER) {
      return 'confirm-preorder';
    } else if (orderStatus === OrderStatusEnum.IN_PROGRESS) {
      return 'accept';
    } else if (
      orderStatus === OrderStatusEnum.COMPLETED &&
      woltOrderFromDb.status !== OrderStatusEnum.COMPLETED
    ) {
      return 'ready';
    } else if (orderStatus === OrderStatusEnum.DELIVERED) {
      return 'delivered';
    } else if (orderStatus === OrderStatusEnum.REJECTED) {
      return 'reject';
    } else {
      return '';
    }
  }
}
