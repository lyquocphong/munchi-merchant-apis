import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { OrderStatusEnum } from 'src/order/dto/order.dto';
import { OrderService } from 'src/order/order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WoltOrderPrismaSelectArgs } from 'src/provider/wolt/wolt.type';

@Injectable()
export class FinancialAnalyticsService {
  constructor(private prismaService: PrismaService, private orderService: OrderService) {}
  async analyzeOrderData(orderingBusinessIds: string[], startDate: string, endDate: string) {
    // Initialize base query
    const baseOrderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
      where: {
        orderingBusinessId: { in: orderingBusinessIds },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: WoltOrderPrismaSelectArgs,
      orderBy: { orderNumber: 'desc' },
    });

    // Initialize reject order query extend base query
    const rejectOrderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
      ...baseOrderArgs,
      where: { ...baseOrderArgs.where, status: OrderStatusEnum.REJECTED },
    });

    // Initialize delivered order query extend base query
    const deliveredOrderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
      ...baseOrderArgs,
      where: { ...baseOrderArgs.where, status: OrderStatusEnum.DELIVERED },
    });

    const rejectedOrders = await this.orderService.getManyOrderByArgs(rejectOrderArgs);

    const deliveredOrders = await this.orderService.getManyOrderByArgs(deliveredOrderArgs);

    const totalOrderCount = rejectedOrders.length + deliveredOrders.length;

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
      totalOrders: totalOrderCount,
      totalSales,
      totalRejections,
      totalRejectionValue,
    };
  }
}
