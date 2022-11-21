import {
  Controller,
  Post,
  Body,
  Get,
} from '@nestjs/common';

import { OrderService } from './order.service';



@Controller('order')
export class OrderController {
  constructor(
    private orderService: OrderService,
  ) {}
  @Get('orders')
   getAllOrders(){
    console.log('All order')
    return this.orderService.getAllOrders()
   }
}
