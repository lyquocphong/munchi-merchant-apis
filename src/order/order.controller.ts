import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { OrderId } from 'src/ts';

import { OrderService } from './order.service';



@Controller('order')
export class OrderController {
  constructor(
    private orderService: OrderService,
    private readonly httpService: HttpService,
  ) {}
  @Get('orders')
  getAllOrders() {
    console.log('All order');
    return this.orderService.getAllOrders();
  }
  @Get(':orderId')
  getOrderbyId(
    @Param('orderId') orderId: OrderId,
  ) {
    return this.orderService.getOrderbyId(
      orderId,
    );
  }
  @Post('newOrder')
  newOrder(@Body() data:any) {
    console.log(data);
    const order =
      this.orderService.newOrder(data);
     this.httpService
       .post(
         'https://webhook.site/3311e65c-34ae-4ecb-a705-9f2c7fa5eec0',
         data,
       )
       .subscribe({
         complete: () => {
           console.log('completed');
         },
         error: (err) => {
           // you can handle error requests here
           console.log(err);
         },
       });

    return order;
  }
  @Put('orders/:orderId')
  rejectOrder(
    @Param('orderId') orderId: OrderId,
  ) {
    return this.orderService.rejectOrder(orderId);
  }
}
