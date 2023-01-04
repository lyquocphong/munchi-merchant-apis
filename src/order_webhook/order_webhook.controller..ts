import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { OrderWebhookService } from './order_webhook.service';

@Controller('webhook')
export class OrderWebhookController {
  constructor(
    private OrderWebhookService: OrderWebhookService,
  ) {}
  @Get('new')
  newOrder() {
    return this.OrderWebhookService.newOrder();
  }
  @Post('new')
  newOrderReciever(@Req() request: Request) {
    return this.OrderWebhookService.newOrderReciever(
      request,
    );
  }
}
