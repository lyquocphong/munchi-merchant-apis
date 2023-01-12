import { Module } from '@nestjs/common';
import { OrderWebhookController } from './order_webhook.controller.';
import { OrderWebhookService } from './order_webhook.service';


@Module({
  controllers: [OrderWebhookController],
   providers: [OrderWebhookService],
  
})
export class OrderWebhookModule {}
