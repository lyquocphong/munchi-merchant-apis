/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

import { OrderingService } from 'src/provider/ordering/ordering.service';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { OrderService } from './order.service';
import { SessionService } from 'src/auth/session.service';

@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrderController {
  constructor(
    private Ordering: OrderingService,
    private utils: UtilsService,
    private orderService: OrderService,
    private sessionService: SessionService
  ) {}
  
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

  @Get(':orderId')
  async getOrderbyId(@Param('orderId') orderId: number, @Request() req: any) {    
    const { sessionPublicId } = req.user;
    const user = await this.sessionService.getSessionUserBySessionPublicId(sessionPublicId);
    return this.orderService.getOrderbyId(user.orderingUserId, orderId);
  }

  @Put(':orderId')
  async updateOrder(
    @Param('orderId') orderId: number,
    @Body() orderData: OrderData,
    @Request() req: any,
  ) {
    const { sessionPublicId } = req.user;
    const user = await this.sessionService.getSessionUserBySessionPublicId(sessionPublicId);
    return this.orderService.updateOrder(user.orderingUserId, orderId, orderData);
  }
}