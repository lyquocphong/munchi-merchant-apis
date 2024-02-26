import { Injectable } from '@nestjs/common';
import { Business, Prisma } from '@prisma/client';
import { SessionService } from 'src/auth/session.service';
import { FinancialAnalyticsService } from 'src/financial-analytics/financial-analytics.service';
import { OrderStatusEnum } from 'src/order/dto/order.dto';
import { OrderService } from 'src/order/order.service';
import { WoltOrderPrismaSelectArgs } from 'src/provider/wolt/wolt.type';
import { Historyquery } from './dto/history,dto';
import { mapToDate } from './utils/getTimeRange';
import { ProviderEnum } from 'src/provider/provider.type';

@Injectable()
export class HistoryService {
  constructor(
    private orderService: OrderService,
    private sessionService: SessionService,
    private financialAnalyticsService: FinancialAnalyticsService,
  ) {}

  async getOrderHistory(sessionPublicId: string, { date, page, rowPerPage }: Historyquery) {
    const sessionArgs = {
      include: {
        businesses: true,
      },
    };
    const session = await this.sessionService.getSessionByPublicId<any>(
      sessionPublicId,
      sessionArgs,
    );
    const orderingBusinessIds = session.businesses.map(
      (business: Business) => business.orderingBusinessId,
    );

    //Map to date base on date value
    const [startDate, endDate] = mapToDate(date);

    const rowPerPageInNumber = parseInt(rowPerPage);
    const pageInNumber = parseInt(page);

    //Create a prisma argument to get order data
    const orderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
      where: {
        orderingBusinessId: {
          in: orderingBusinessIds,
        },
        status: {
          in: [OrderStatusEnum.DELIVERED, OrderStatusEnum.REJECTED],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: WoltOrderPrismaSelectArgs,
      orderBy: {
        orderNumber: 'desc',
      },
      take: rowPerPageInNumber,
      skip: (pageInNumber - 1) * rowPerPageInNumber,
    });

    const order = await this.orderService.getManyOrderByArgs(orderArgs);

    const analyticsData = await this.financialAnalyticsService.analyzeOrderData(
      orderingBusinessIds,
      startDate,
      endDate,
    );

    return {
      ...analyticsData,
      orders: order,
    };
  }

  async getProductHistory(sessionPublicId: string, { date, page, rowPerPage }: Historyquery) {
    const rowPerPageInNumber = parseInt(rowPerPage);
    const pageInNumber = parseInt(page);

    const sessionArgs = {
      include: {
        businesses: true,
      },
    };
    const session = await this.sessionService.getSessionByPublicId<any>(
      sessionPublicId,
      sessionArgs,
    );
    const orderingBusinessIds = session.businesses.map(
      (business: Business) => business.orderingBusinessId,
    );
    console.log(
      '🚀 ~ HistoryService ~ getProductHistory ~ orderingBusinessIds:',
      orderingBusinessIds,
    );

    const [startDate, endDate] = mapToDate(date);

    const result: any[] = [];

    await Promise.all(
      orderingBusinessIds.map(async (orderingBusinessId: string) => {
        const orderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
          where: {
            orderingBusinessId: orderingBusinessId,
            provider: {
              in: [ProviderEnum.Munchi, ProviderEnum.Wolt],
            },
            status: OrderStatusEnum.DELIVERED,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: WoltOrderPrismaSelectArgs,
          orderBy: {
            orderNumber: 'desc',
          },
        });

        const order = await this.orderService.getManyOrderByArgs(orderArgs);

        const analyticsData = await this.financialAnalyticsService.analyzeProductData(order);
        console.log(
          '🚀 ~ HistoryService ~ orderingBusinessIds.map ~ analyticsData:',
          analyticsData,
        );

        result.push(order);
      }),
    );

    //   [ // Array of Restaurant Objects
    //   {
    //     "restaurantId": 1,
    //     "restaurantName": "Pizza Place",
    //     "salesByProvider": [  // Array of sales data per provider
    //       {
    //         "provider": "Wolt",
    //         "products": [
    //           {
    //             "productName": "Margherita Pizza",
    //             "quantitySold": 10
    //           },
    //           // ...
    //         ]
    //       },
    //       {
    //         "provider": "Uber Eats",
    //         "products": [
    //           {
    //             "productName": "Margherita Pizza",
    //             "quantitySold": 5
    //           },
    //           // ...
    //         ]
    //       }
    //       // ...
    //     ]
    //   },
    //   // ... other restaurants
    // ]
    return result;
  }
}
