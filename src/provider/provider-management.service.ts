import { Injectable } from '@nestjs/common';
import { AvailableProvider, ProviderEnum } from './provider.type';
import { WoltService } from './wolt/wolt.service';
import { OrderingService } from './ordering/ordering.service';
import { OrderingOrder } from './ordering/ordering.type';
import { AvailableOrderStatus, OrderResponse } from '../order/dto/order.dto';
@Injectable()
export class ProviderManagmentService {
  constructor(private woltService: WoltService, private orderingService: OrderingService) {}

  async getAllOrder(provider: string[], { orderingToken }: { orderingToken: string }) {
    const woltOrder = this.woltService.getAllOrder();
    return woltOrder;
  }

  async getOrderByStatus(
    provider: string[],
    status: AvailableOrderStatus,
    businessOrderingIds: string[],
    { orderingToken }: { orderingToken: string },
  ) {
    let finalResult: OrderResponse[] = [];
    //There only 2 case here as the munchi provider should always be active and can't be disabled

    //Map from order status to ordering stus
    const orderStatus = this.orderingService.mapOrderingStatusToOrderStatus(
      undefined,
      status,
    ) as number[];

    // Convert order status from number array to a string
    const mappedOrderStatusString = orderStatus.map((el: number) => el.toString()).join(',');

    const orderingOrders = await this.orderingService.getOrderByStatus(
      orderingToken,
      mappedOrderStatusString,
      businessOrderingIds,
    );

    const formattedOrderingOrders = await Promise.all(
      orderingOrders.map(async (order: OrderingOrder) => {
        return await this.orderingService.mapOrderToOrderResponse(order);
      }),
    );
    if (provider.includes(ProviderEnum.Wolt)) {
      const woltOrders = await this.woltService.getOrderByStatus(
        orderingToken,
        status,
        businessOrderingIds,
      );
      return [...woltOrders, ...formattedOrderingOrders];
    }

    return formattedOrderingOrders;
  }

  async getOrderById(
    orderId: string,
    provider: AvailableProvider,
    { orderingToken }: { orderingToken: string },
  ) {
    if (provider === ProviderEnum.Wolt) {
      const woltOrder = await this.woltService.getOrderById(orderId);
      return this.woltService.mapOrderToOrderResponse(woltOrder);
    } else if (provider === ProviderEnum.Munchi) {
      const orderingOrder = await this.orderingService.getOrderById(orderingToken, orderId);
      return this.orderingService.mapOrderToOrderResponse(orderingOrder);
    }
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
      return await this.orderingService.updateOrder(orderingToken, orderId, updateData);
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
