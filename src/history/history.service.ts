import { Injectable } from '@nestjs/common';
import { Business, Prisma, Provider } from '@prisma/client';
import { SessionService } from 'src/auth/session.service';
import { BusinessService } from 'src/business/business.service';
import { FinancialAnalyticsService } from 'src/financial-analytics/financial-analytics.service';
import { OrderStatusEnum } from 'src/order/dto/order.dto';
import { OrderService } from 'src/order/order.service';
import { ProviderEnum } from 'src/provider/provider.type';
import { WoltOrderPrismaSelectArgs } from 'src/provider/wolt/wolt.type';
import { Historyquery } from './dto/history,dto';
import { mapToDate } from './utils/getTimeRange';

@Injectable()
export class HistoryService {
  constructor(
    private orderService: OrderService,
    private sessionService: SessionService,
    private businessService: BusinessService,
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

    const [startDate, endDate] = mapToDate(date);

    const result: any[] = [];

    await Promise.all(
      orderingBusinessIds.map(async (orderingBusinessId: string) => {
        const businessIncludeArgs = Prisma.validator<Prisma.BusinessArgs>()({
          include: {
            provider: true,
          },
        });

        // Check business provider
        const business = await this.businessService.findBusinessByOrderingId(
          orderingBusinessId,
          businessIncludeArgs,
        );

        //Initialize the business response with initial data
        const businessObj = {
          id: business.publicId,
          name: business.name,
          salesByProvider: [],
        };

        //Munchi productr is compulsory
        const munchiOrderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
          where: {
            orderingBusinessId: orderingBusinessId,
            provider: ProviderEnum.Munchi,
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

        const order = await this.orderService.getManyOrderByArgs(munchiOrderArgs);

        const munchiAnalyticsData = await this.financialAnalyticsService.analyzeProductData(order);

        businessObj.salesByProvider.push({
          provider: ProviderEnum.Munchi,
          products: munchiAnalyticsData,
        });

        //Analyze orders sold by other provider
        if (business.provider.length !== 0) {
          await Promise.all(
            business.provider.map(async (provider: Provider) => {
              //Analyzer order by provider
              const providerOrderArgs = Prisma.validator<Prisma.OrderFindManyArgs>()({
                where: {
                  orderingBusinessId: orderingBusinessId,
                  provider: provider.name,
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

              const providerOrder = await this.orderService.getManyOrderByArgs(providerOrderArgs);

              const providerAnalyticsData = await this.financialAnalyticsService.analyzeProductData(
                providerOrder,
              );

              businessObj.salesByProvider.push({
                provider: provider.name,
                products: providerAnalyticsData,
              });
            }),
          );
        }

        result.push(businessObj);
      }),
    );
    return result;
  }
}
