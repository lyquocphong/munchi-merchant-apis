import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';

import { OrderService } from './order.service';
@UseGuards(JwtGuard)
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService, private utils: UtilsService) {}
  @Get('orders')
  async getAllOrders(@Request() req) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    console.log('All order');
    return this.orderService.getAllOrders(accessToken);
  }

  @Get(':orderId')
  async getOrderbyId(@Param('orderId') orderId: number, @Request() req: any) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.orderService.getOrderbyId(orderId, accessToken);
  }

  @Put('orders/:orderId')
  rejectOrder(@Param('orderId') orderId: number) {
    return this.orderService.rejectOrder(orderId);
  }

  updateOrder(@Param('orderId') orderId: number, @Body() data: OrderData) {
    return this.orderService.updateOrder(orderId, data);
  }
}
