import { Injectable, Logger } from '@nestjs/common';
import { AvailableOrderStatus } from '../order/dto/order.dto';
import { OrderingService } from './ordering/ordering.service';
import { OrderingOrder } from './ordering/ordering.type';
import { AvailableProvider, ProviderEnum } from './provider.type';
import { WoltService } from './wolt/wolt.service';

@Injectable()
export class ProviderManagmentService {
  constructor(private woltService: WoltService, private orderingService: OrderingService) {}
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

    //If wolt provider included in the body data
    if (provider.includes(ProviderEnum.Wolt)) {
      const woltOrders = await this.woltService.getOrderByStatus(
        orderingToken,
        status,
        businessOrderingIds,
      );
      return [
        ...woltOrders,
        ...formattedOrderingOrders.sort((a, b) => parseInt(b.id) - parseInt(a.id)),
      ];
    }

    return formattedOrderingOrders;
  }

  async getOrderById(orderId: string, { orderingToken }: { orderingToken: string }) {
    const woltOrder = await this.woltService.getOrderByIdFromDb(orderId);

    if (!woltOrder) {
      const orderingOrder = await this.orderingService.getOrderById(orderingToken, orderId);
      const mapToOrderResponse = await this.orderingService.mapOrderToOrderResponse(orderingOrder);
      return mapToOrderResponse;
    }

    return woltOrder;
  }

  async updateOrder(
    provider: AvailableProvider,
    orderId: string,
    updateData: {
      orderStatus: AvailableOrderStatus;
      preparedIn: string;
    },
    { orderingToken }: { orderingToken: string },
  ) {
    if (provider === ProviderEnum.Wolt) {
      return await this.woltService.updateOrder(orderingToken, orderId, updateData);
    } else if (provider === ProviderEnum.Munchi) {
      const orderingOrder = await this.orderingService.updateOrder(
        orderingToken,
        orderId,
        updateData,
      );
      return await this.orderingService.mapOrderToOrderResponse(orderingOrder);
    }
  }

  async rejectOrder(
    provider: AvailableProvider,
    orderId: string,
    orderRejectData: {
      reason: string;
    },
    { orderingToken }: { orderingToken: string },
  ) {
    if (provider === ProviderEnum.Wolt) {
      return await this.woltService.rejectOrder(orderingToken, orderId, orderRejectData);
    } else if (provider === ProviderEnum.Munchi) {
      const orderingOrder = await this.orderingService.rejectOrder(orderingToken, orderId);
      const order = await this.orderingService.mapOrderToOrderResponse(orderingOrder);
      return order;
    }
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
