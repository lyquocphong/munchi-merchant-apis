/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { BusinessModule } from 'src/business/business.module';
import { UtilsModule } from 'src/utils/utils.module';
import { WebhookController } from './webhook.controller.';
import { WebhookService } from './webhook.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [forwardRef(() => BusinessModule), UtilsModule, forwardRef(() => NotificationModule)],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule { }
