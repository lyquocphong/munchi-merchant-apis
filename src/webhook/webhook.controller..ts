/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private WebhookService: WebhookService) {}
  @Post('newOrder')
  newOrder(@Body() order: any) {
    return this.WebhookService.newOrderNotification(order);
  }
  @Post('statusChange')
  changeOrder(@Body() order: any) {
    return this.WebhookService.changeOrderNotification(order);
  }
}
