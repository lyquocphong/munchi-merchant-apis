import { Body, Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { FilterQuery, OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';

@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderingIo: OrderingIoService, private utils: UtilsService) {}
  @Get('allOrders')
  async getAllOrders(@Request() req: any) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getAllOrders(accessToken);
  }
  @Get('filteredOrders')
  async getFilteredOrders(@Request() req, @Body() filterQuery: FilterQuery) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);

    const paramsQuery = [
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
    ].join();
    return this.orderingIo.getFilteredOrders(accessToken, filterQuery, paramsQuery);
  }
  @Get(':orderId')
  async getOrderbyId(@Param('orderId') orderId: number, @Request() req: any) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getOrderbyId(orderId, accessToken);
  }

  @Put(':orderId')
  async updateOrder(
    @Param('orderId') orderId: number,
    @Body() orderData: OrderData,
    @Request() req: any,
  ) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.updateOrder(orderId, orderData, accessToken);
  }

  @Delete(':orderId')
  async removeOrder(@Param('orderId') orderId: number, @Request() req: any) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.removeOrder(orderId, accessToken);
  }
}
