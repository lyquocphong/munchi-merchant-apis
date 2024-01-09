import { Injectable } from '@nestjs/common';
import { Order } from 'ordering-api-sdk';
import { OrderResponse } from 'src/order/dto/order.dto';
import { OrderData } from 'src/type';
import { OrderingOrder } from './ordering/ordering.type';
import { ProviderOrder } from './provider.type';

@Injectable()
export abstract class ProviderService {
  async getAllOrder(accessToken: string, id: string): Promise<any> {
    return;
  }

  async getOrderById(accessToken: string, id: string): Promise<ProviderOrder> {
    return;
  }

  //Need business ids here as we need to get order from multiple businesses at a time
  async getOrderByStatus(
    accessToken: string,
    status: string,
    businessIds: string[],
  ): Promise<OrderResponse[] | OrderingOrder[]> {
    return;
  }

  async updateOrder(
    accessToken: string,
    orderId: string,
    orderData: OrderData,
  ): Promise<Order | OrderResponse> {
    return;
  }

  async mapOrderToOrderResponse(order: ProviderOrder): Promise<OrderResponse> {
    return;
  }
}
