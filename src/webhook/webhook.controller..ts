/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Post, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('newOrder')
  newOrder(@Body() order: any) {
    return this.webhookService.newOrderNotification(order);
  }

  @Post('statusChange')
  changeOrder(@Body() order: any) {
    return this.webhookService.changeOrderNotification(order);
  }

  @Post('wolt/newOrder')
  woltNewOrder(@Body() order: any, @Req() request: Request) {
    return this.webhookService.newWoltOrderNotification();
  }
}
