import { Injectable } from '@nestjs/common';
import { OrderingOrderProvider } from './provider/ordering-provider';
import { OrderProviderDto, OrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderManager {
    constructor(
        private orderingOrderProvider: OrderingOrderProvider
    ) { }

    async getOrders(query: GetOrderQueryDto, sessionPublicId: string) {
        switch (providerName) {
            case OrderProviderDto.ORDERING_CO:
                await this.orderingOrderProvider.getOrders();
                break;
            default:
                throw new Error(`Unsupported provider: ${providerName}`);
        }
    }
}