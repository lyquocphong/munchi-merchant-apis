import { Body, Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { FilterQuery, OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';

import { OrderService } from './order.service';
@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService, private utils: UtilsService) {}
  @Get('allOrders')
  async getAllOrders(@Request() req: any) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    console.log('All order');
    return this.orderService.getAllOrders(accessToken);
  }
  @Get('filteredOrders')
  async getFilteredOrders(@Request() req, @Body() filterQuery: FilterQuery) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);

    const paramArray = [
      'id',
      'paymethod_id',
      'business_id',
      'customer_id',
      'status',
      'delivery_type',
      'delivery_datetime',
      'prepared_in',
      'products',
      'summary',
    ];
    const paramsQuery = paramArray.join();
    console.log(paramsQuery);
    // console.log(filterQuery)
    return this.orderService.getFilteredOrders(accessToken, filterQuery, paramsQuery);
  }
  @Get(':orderId')
  async getOrderbyId(@Param('orderId') orderId: number, @Request() req: any) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.orderService.getOrderbyId(orderId, accessToken);
  }

  @Put(':orderId')
  async updateOrder(
    @Param('orderId') orderId: number,
    @Body() orderData: OrderData,
    @Request() req: any,
  ) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.orderService.updateOrder(orderId, orderData, accessToken);
  }

  @Delete(':orderId')
  async removeOrder(@Param('orderId') orderId: number, @Request() req: any) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.orderService.removeOrder(orderId, accessToken);
  }
}
