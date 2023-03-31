import { Body, Controller, Post } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { WebhookService } from './webhook.service';
@Controller('webhook')
export class WebhookController {
  constructor(
    private WebhookService: WebhookService,
  ) {}
  @Post('newOrder')
  newOrder(@Body() order:any) {
    return this.WebhookService.newOrderNotification(order)
  }
}
