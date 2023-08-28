import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { BusinessModule } from 'src/business/business.module';

@Module({
  imports: [PrismaModule, BusinessModule],
  providers: [NotificationService, OneSignalService],
  exports: [NotificationService],
})
export class NotificationModule {}
