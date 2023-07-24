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
      const numberOfMinutesForSchedule = 2;
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

  @Interval(10000)
  async createOpenAppPushNotification() {
    console.log('Start open app notification');

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const existingNotification = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.OPEN_APP,
        scheduledAt: {
          gte: oneMinuteAgo,
          lte: now,
        },
      },
    });

    if (1==0 && existingNotification.length == 0) {
      this.logger.log('Do not need to make any push notification');
    } else {
      //const externalIds = existingNotification.map(notification => notification.deviceId);
      const externalIds = ['547a93bc-d63e-4563-bcdd-63f1bd36fad4', '2af4ad2f-bd96-4e54-95a3-dfa473a65a06']
      this.logger.log(`Make push notification to: ${JSON.stringify(externalIds)}`);
      this.onesignal.pushOpenAppNotification(externalIds)

      this.prisma.notification.deleteMany({
        where: {
          deviceId: {
            in: externalIds
          }
        }
      })
    }

    this.logger.log('End open app notification');
  }
}
