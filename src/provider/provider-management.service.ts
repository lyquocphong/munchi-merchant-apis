import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AvailableOrderStatus } from '../order/dto/order.dto';
import { OrderingService } from './ordering/ordering.service';
import { OrderingOrder } from './ordering/ordering.type';
import { AvailableProvider, ProviderEnum } from './provider.type';
import { WoltService } from './wolt/wolt.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class ProviderManagmentService {
  constructor(
    private woltService: WoltService,
    private utilService: UtilsService,
    private orderingService: OrderingService,
    private eventEmitter: EventEmitter2,
  ) {}
  private readonly logger = new Logger(ProviderManagmentService.name);
  async getAllOrder(provider: string[], { orderingToken }: { orderingToken: string }) {
    const woltOrder = this.woltService.getAllOrder();
    return woltOrder;
  }

  async getOrderByStatus(
    provider: string[],
    status: AvailableOrderStatus[],
    businessOrderingIds: string[],
    { orderingToken }: { orderingToken: string },
  ) {
    //There only 2 case here as the munchi provider should always be active and can't be disabled

    const orderingOrders = await this.orderingService.getOrderByStatus(
      orderingToken,
      status,
      businessOrderingIds,
    );

    const formattedOrderingOrders = await Promise.all(
      orderingOrders.map(async (order: OrderingOrder) => {
        this.logger.log(
          `Success in retrieving order for ${order.business.name} with status ${order.status}`,
        );
        return await this.orderingService.mapOrderToOrderResponse(order);
      }),
    );

    // TODO: Map provider enum to an array then use that array to map to get order from the database. Filter out "Munchi" first as it is not stored in our database
    //If wolt provider included in the body data
    if (provider.includes(ProviderEnum.Wolt)) {
      const orderBy = Prisma.validator<Prisma.OrderOrderByWithRelationInput>()({
        id: 'asc',
      });

      const woltOrders = await this.woltService.getOrderByStatus(
        orderingToken,
        status,
        businessOrderingIds,
        orderBy,
      );

      const allOrders = [...woltOrders, ...formattedOrderingOrders];
      const sortedOrders = allOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });

      return sortedOrders;
    }

    return formattedOrderingOrders;
  }

  async getOrderById(orderId: string, orderingUserId: number) {
    // TODO: Need to be refactored so can work with other provider in the future
    const woltOrder = await this.woltService.getOrderByIdFromDb(orderId);

    if (!woltOrder) {
      const accessToken = await this.utilService.getOrderingAccessToken(orderingUserId);
      const orderingOrder = await this.orderingService.getOrderById(accessToken, orderId);
      const mapToOrderResponse = await this.orderingService.mapOrderToOrderResponse(orderingOrder);
      return mapToOrderResponse;
    }

    return woltOrder;
  }

  async updateOrder(
    provider: AvailableProvider,
    orderingUserId: number,
    orderId: string,
    updateData: {
      orderStatus: AvailableOrderStatus;
      preparedIn: string;
    },
  ) {
    if (provider === ProviderEnum.Wolt) {
      return await this.woltService.updateOrder(orderingUserId, orderId, updateData);
    } else if (provider === ProviderEnum.Munchi) {
      const orderingOrder = await this.orderingService.updateOrder(
        orderingUserId,
        orderId,
        updateData,
      );
      return await this.orderingService.mapOrderToOrderResponse(orderingOrder);
    }
  }

  async rejectOrder(
    provider: AvailableProvider,
    orderId: string,
    orderingUserId: number,
    orderRejectData: {
      reason: string;
    },
  ) {
    let order: any;
    if (provider === ProviderEnum.Wolt) {
      order = await this.woltService.rejectOrder(orderingUserId, orderId, orderRejectData);
    } else if (provider === ProviderEnum.Munchi) {
      const orderingOrder = await this.orderingService.rejectOrder(orderingUserId, orderId);
      order = await this.orderingService.mapOrderToOrderResponse(orderingOrder);
    }

    // Validating preoder queue in case preorder been rejected after confirmed
    this.eventEmitter.emit('preorderQueue.validate', parseInt(orderId));

    return order;
  }

  async validateProvider(providers: string[] | string): Promise<boolean> {
    const providerArray: string[] = Object.values(ProviderEnum);

    if (typeof providers === 'string') {
      return providerArray.includes(providers);
    }

    return (
      Array.isArray(providers) && providers.every((provider) => providerArray.includes(provider))
    );
  }
}
