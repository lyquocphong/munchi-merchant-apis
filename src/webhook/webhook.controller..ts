/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Post, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { WoltOrderNotification } from 'src/provider/wolt/wolt.type';

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

  @Post('wolt/notification')
  woltNewOrder(@Body() woltWebhookdata: WoltOrderNotification, @Req() request: Request) {
    return this.webhookService.newWoltOrderNotification(woltWebhookdata);
  }
}
