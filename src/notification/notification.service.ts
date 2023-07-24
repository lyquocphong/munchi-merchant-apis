// notification/notification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification.type';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) { }

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

    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        type: NotificationType.OPEN_APP,
        scheduledAt: {
          gte: oneMinuteAgo,
          lte: now,
        },
      },
    });

    this.logger.log('Start open app notification');
  }
}
