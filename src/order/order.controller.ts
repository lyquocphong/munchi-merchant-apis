/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { Post, Query } from '@nestjs/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

import { OrderingService } from 'src/provider/ordering/ordering.service';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { OrderService } from './order.service';
import { SessionService } from 'src/auth/session.service';
import { AvailableProvider } from 'src/provider/provider.type';
import { AvailableOrderStatus } from './dto/order.dto';

@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService, private sessionService: SessionService) {}

  //TODO: Need to refactor publicBussinessId use later, right now it come from session
  @Get('filteredOrders')
  async getFilteredOrders(
    @Request() req: any,
    @Query('query') query: string,
    @Query('paramsQuery') paramsQuery: string[],
    @Query('publicBusinessId') publicBusinessId: string,
  ) {
    const { sessionPublicId } = req.user;
    return this.orderService.getFilteredOrdersForSession(sessionPublicId, query, paramsQuery);
  }

  @Post('orderByStatus')
  async getOrderByStatus(
    @Body()
    bodyData: {
      providers: string[];
      status: AvailableOrderStatus;
      businessPublicIds: string[];
    },
    @Request() req: any,
  ) {
    const { orderingUserId } = req.user;

    return this.orderService.getOrderByStatus(orderingUserId, bodyData);
  }

  @Get(':orderId')
  async getOrderbyId(@Param('orderId') orderId: string, @Request() req: any) {
    const { orderingUserId } = req.user;

    return this.orderService.getOrderbyId(orderingUserId, orderId);
  }

  @Post('')
  async postOrderbyId(
    @Body() orderData: { orderId: string; provider: AvailableProvider },
    @Request() req: any,
  ) {
    const { orderingUserId } = req.user;
    return this.orderService.postOrderbyId(orderingUserId, orderData);
  }

  @Put(':orderId')
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() orderData: OrderData,
    @Request() req: any,
  ) {
    const { orderingUserId } = req.user;

    return this.orderService.updateOrder(orderingUserId, orderId, orderData);
  }
}
