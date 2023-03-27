import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/business/business.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { WebhookController } from './webhook.controller.';
import { WebhookService } from './webhook.service';

@Module({
  imports: [BusinessModule, UserModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class OrderWebhookModule {}
