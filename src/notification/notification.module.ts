import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OneSignalService } from 'src/onesignal/onesignal.service';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, OneSignalService],
  exports: [NotificationService],
})
export class NotificationModule {}
