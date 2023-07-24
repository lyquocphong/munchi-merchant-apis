// notification/notification.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification.type';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

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
}
