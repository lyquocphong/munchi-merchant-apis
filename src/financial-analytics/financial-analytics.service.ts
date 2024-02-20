import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { OrderStatusEnum } from 'src/order/dto/order.dto';
import { OrderService } from 'src/order/order.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FinancialAnalyticsService {
  constructor(private prismaService: PrismaService, private orderService: OrderService) {}
  async analyzeOrderData(orderingBusinessIds: string[], startDate: string, endDate: string) {
    const order = await this.orderService.getOrderByDate(orderingBusinessIds, startDate, endDate);

    const deliveredOrders = order.filter(
      (order: Order) => order.status === OrderStatusEnum.DELIVERED,
    );

    const rejectedOrders = order.filter(
      (order: Order) => order.status === OrderStatusEnum.REJECTED,
    );
    const totalRejections = rejectedOrders.length;

    const totalRejectionValue = rejectedOrders.reduce(
      (sum, order) => sum + parseFloat(order.summary.total),
      0,
    );

    const totalSales = deliveredOrders.reduce(
      (sum, order) => sum + parseFloat(order.summary.total),
      0,
    );

    return {
      totalOrders: order.length,
      totalSales,
      totalRejections,
      totalRejectionValue,
    };
  }
}
