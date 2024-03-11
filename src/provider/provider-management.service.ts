import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AvailableOrderStatus, OrderResponse } from '../order/dto/order.dto';
import { OrderingService } from './ordering/ordering.service';
import { OrderingOrder } from './ordering/ordering.type';
import { AvailableProvider, ProviderEnum } from './provider.type';
import { WoltService } from './wolt/wolt.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilsService } from 'src/utils/utils.service';
import { WoltRepositoryService } from './wolt/wolt-repository';
import { OrderingOrderMapperService } from './ordering/ordering-order-mapper';
import { ProviderService } from './provider.service';

@Injectable()
export class ProviderManagmentService {
  constructor(
    private woltService: WoltService,
    private woltRepositoryService: WoltRepositoryService,
    private utilService: UtilsService,
    private orderingService: OrderingService,
    private orderingOrderMapperService: OrderingOrderMapperService,
    private eventEmitter: EventEmitter2,
  ) {}
  private readonly logger = new Logger(ProviderManagmentService.name);

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
        return await this.orderingOrderMapperService.mapOrderToOrderResponse(order);
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
    // TODO: Need to be refactored so can work with other providers in the future
    const woltOrder = await this.woltRepositoryService.getOrderByIdFromDb(orderId);

    if (!woltOrder) {
      const accessToken = await this.utilService.getOrderingAccessToken(orderingUserId);
      const orderingOrder = await this.orderingService.getOrderById(accessToken, orderId);
      const mapToOrderResponse = await this.orderingOrderMapperService.mapOrderToOrderResponse(
        orderingOrder,
      );
      return mapToOrderResponse;
    }

    return woltOrder;
  }

  // TODO: Test update order and reject order after refactor
  async updateOrder(
    provider: AvailableProvider,
    orderingUserId: number,
    orderId: string,
    updateData: {
      orderStatus: AvailableOrderStatus;
      preparedIn: string;
    },
  ) {
    const providerService = this.mapProviderToService(provider);

    return providerService.updateOrder(orderingUserId, orderId, updateData);
  }

  async rejectOrder(
    provider: AvailableProvider,
    orderId: string,
    orderingUserId: number,
    orderRejectData: {
      reason: string;
    },
  ) {
    let order: OrderingOrder | OrderResponse;
    const providerService = this.mapProviderToService(provider);

    order = await providerService.rejectOrder(orderingUserId, orderId, orderRejectData);

    // Map from ordering order to order response
    if (provider === ProviderEnum.Munchi) {
      order = await this.orderingOrderMapperService.mapOrderToOrderResponse(order as OrderingOrder);
    }

    // Validating preoder queue in case preorder been rejected after confirmed
    this.eventEmitter.emit('preorderQueue.validate', parseInt(orderId));

    return order as OrderResponse;
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

  // Retrieves the appropriate ProviderService based on the provided 'provider'.
  // Returns null if no matching service is configured.
  mapProviderToService(provider: AvailableProvider): ProviderService | null {
    const providerServiceMap: Record<AvailableProvider, ProviderService> = {
      [ProviderEnum.Munchi]: this.orderingService,
      [ProviderEnum.Wolt]: this.woltService,
    };
    return providerServiceMap[provider] || null;
  }
}
