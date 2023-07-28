// notification/notification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification.type';
import { Interval } from '@nestjs/schedule';
import { OneSignalService } from 'src/onesignal/onesignal.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly onesignal: OneSignalService
  ) { }

  async createOpenAppNotification(deviceId: string) {
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        type: NotificationType.OPEN_APP,
        deviceId: deviceId,
      },
    });

    if (!existingNotification) {
      const numberOfMinutesForSchedule = 1;
      const scheduledAt = new Date();
      scheduledAt.setMinutes(scheduledAt.getMinutes() + numberOfMinutesForSchedule);

      await this.prisma.notification.create({
        data: {
          type: NotificationType.OPEN_APP,
          deviceId: deviceId,
          scheduledAt
        },
      });
    }
  }

  async removeOpenAppNotifications(deviceId: string) {
    await this.prisma.notification.deleteMany({
      where: {
        type: NotificationType.OPEN_APP,
        deviceId: deviceId,
      },
    });
  }

  @Interval(50000)
  async createOpenAppPushNotification() {
    this.logger.log('Start open app notification');

    const existingNotification = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.OPEN_APP
      },
    });

    this.logger.log(`Existing notification: ${existingNotification.length}`);
    if (existingNotification.length == 0) {
      this.logger.log('Do not need to make any push notification');
    } else {
      const externalIds = existingNotification.map(notification => notification.deviceId);
      this.logger.log(`Make push notification to: ${JSON.stringify(externalIds)}`);
      this.onesignal.pushOpenAppNotification(externalIds)
    }

    this.logger.log('End open app notification');
  }
}
