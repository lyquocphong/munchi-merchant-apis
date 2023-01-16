import { Module } from '@nestjs/common';
import { OrderWebhookController } from './webhook.controller.';
import { OrderWebhookService } from './webhook.service';


@Module({
  controllers: [OrderWebhookController],
   providers: [OrderWebhookService],
  
})
export class OrderWebhookModule {}
