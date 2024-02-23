import { Injectable } from '@nestjs/common';
import { Business, Prisma } from '@prisma/client';
import moment from 'moment';
import { SessionService } from 'src/auth/session.service';
import { FinancialAnalyticsService } from 'src/financial-analytics/financial-analytics.service';
import { OrderService } from 'src/order/order.service';
import { Historyquery } from './dto/history,dto';
import {
  getLastMonthRange,
  getLastWeekRange,
  getThisMonthRange,
  getThisWeekRange,
} from './utils/getTimeRange';
import { WoltOrderPrismaSelectArgs } from 'src/provider/wolt/wolt.type';
import { OrderStatusEnum } from 'src/order/dto/order.dto';

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

    let startDate: string;
    let endDate: string;

    if (date === 'today') {
      startDate = moment().startOf('day').toISOString();
      endDate = moment().endOf('day').toISOString();
    } else if (date === 'yesterday') {
      startDate = moment().subtract(1, 'days').startOf('day').toISOString();
      endDate = moment().subtract(1, 'days').endOf('day').toISOString();
    } else if (date === 'this-week') {
      const [lastWeekStart, lastWeekEnd] = getThisWeekRange();
      startDate = lastWeekStart.toISOString();
      endDate = lastWeekEnd.toISOString();
    } else if (date === 'this-month') {
      const [lastWeekStart, lastWeekEnd] = getThisMonthRange();
      startDate = lastWeekStart.toISOString();
      endDate = lastWeekEnd.toISOString();
    } else if (date === 'last-week') {
      const [lastWeekStart, lastWeekEnd] = getLastWeekRange();
      startDate = lastWeekStart.toISOString();
      endDate = lastWeekEnd.toISOString();
    } else if (date === 'last-month') {
      const [lastMonthStart, lastMonthEnd] = getLastMonthRange();
      startDate = lastMonthStart.toISOString();
      endDate = lastMonthEnd.toISOString();
    }

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
    console.log('🚀 ~ HistoryService ~ getOrderHistory ~ order:', order);

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
}
