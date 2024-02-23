import { Injectable } from '@nestjs/common';
import { Business } from '@prisma/client';
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

    const rowPerPageInNumbrt = parseInt(rowPerPage);
    const pageInNumbrt = parseInt(page);

    const order = await this.orderService.getOrderByDate(
      orderingBusinessIds,
      startDate,
      endDate,
      rowPerPageInNumbrt,
      pageInNumbrt,
    );

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
