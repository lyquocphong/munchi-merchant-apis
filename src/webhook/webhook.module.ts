import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderModule } from 'src/order/order.module';
import { OrderWebhookController } from './webhook.controller.';
import { OrderWebhookService } from './webhook.service';


@Module({
  imports: [OrderModule, HttpModule],
  controllers: [OrderWebhookController],
   providers: [OrderWebhookService],
  
})
export class OrderWebhookModule {}
