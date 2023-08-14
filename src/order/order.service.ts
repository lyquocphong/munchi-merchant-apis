import { OrderManager } from './order.manager';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { UtilsService } from 'src/utils/utils.service';
import { GetOrderQueryDto, OrderDto, OrderProviderDto, OrderStatusDto } from './dto/order.dto';
import { BusinessService } from 'src/business/business.service';
import { OrderData } from 'src/type';
import { OrderingOrderProvider } from './provider/ordering-provider';

@Injectable()
export class OrderService {  

  constructor(
    private readonly orderingIo: OrderingIoService,
    private readonly utils: UtilsService,
    private readonly business: BusinessService,
    private readonly orderManager: OrderManager
  ) { }

  async getFilteredOrders(
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
      const response = await this.orderingIo.getFilteredOrders(
        accessToken,
        business.orderingBusinessId,
        query,
        paramsQuery,
      );
      return plainToClass(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrderbyId(userId: number, orderId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    try {
      const response = await this.orderingIo.getOrderbyId(accessToken, orderId);
      return plainToClass(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async updateOrder(userId: number, orderId: number, orderData: OrderData) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    try {
      const response = await this.orderingIo.updateOrder(accessToken, orderId, orderData);
      return plainToClass(OrderDto, response);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async deleteOrder(userId: number, orderId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    try {
      const response = await this.orderingIo.deleteOrder(accessToken, orderId);
      return response;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrders(query: GetOrderQueryDto, sessionPublicId: string) {
    return await this.orderManager.getOrders(query, sessionPublicId);
  }
}
