/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

import { SessionService } from 'src/auth/session.service';
import { OrderData } from 'src/type';
import { OrderRejectData, OrderStatusFilter } from './validation/order.validation';
import { OrderService } from './order.service';

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

  @Get('orderByStatus')
  async getOrderByStatus(
    @Request() request: any,
    @Query(new ValidationPipe({ transform: true })) queryData: OrderStatusFilter,
  ) {
    console.log("🚀 ~ OrderController ~ queryData:", queryData)
    const { orderingUserId } = request.user;

    return this.orderService.getOrderByStatus(orderingUserId, queryData);
  }

  @Get(':orderId')
  async getOrderbyId(@Param('orderId') orderId: string, @Request() req: any) {
    const { orderingUserId } = req.user;

    return this.orderService.getOrderbyId(orderingUserId, orderId);
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

  @Put(':orderId/reject')
  async rejectOrder(
    @Param('orderId') orderId: string,
    @Body() orderRejectData: OrderRejectData,
    @Request() req: any,
  ) {
    const { orderingUserId } = req.user;

    return this.orderService.rejectOrder(orderingUserId, orderId, orderRejectData);
  }
}
