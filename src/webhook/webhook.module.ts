import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/business/business.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { OrderWebhookController } from './webhook.controller.';
import { OrderWebhookService } from './webhook.service';


@Module({
  imports: [BusinessModule],
  controllers: [OrderWebhookController],
   providers: [OrderWebhookService],
   exports: [OrderWebhookService]
  
})
export class OrderWebhookModule {}
