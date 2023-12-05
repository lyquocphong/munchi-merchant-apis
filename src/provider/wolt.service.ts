import { Injectable } from '@nestjs/common';
import { Provider } from './provider.interface';

@Injectable()
export class WoltService implements Provider {
  async getAllOrder(): Promise<void> {}

  async getOrderById(orderId: string): Promise<void> {}

  async updateOrder(orderId: string): Promise<void> {}

  async deleteOrder(orderId: string): Promise<void> {}
}
