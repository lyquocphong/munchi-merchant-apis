/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BusinessModule } from 'src/business/business.module';
import { UserModule } from 'src/user/user.module';
import { UtilsModule } from 'src/utils/utils.module';
import { WebhookController } from './webhook.controller.';
import { WebhookService } from './webhook.service';

@Module({
  imports: [BusinessModule, UserModule, UtilsModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class OrderWebhookModule {}
