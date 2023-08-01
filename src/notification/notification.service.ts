// notification/notification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification.type';
import { Interval } from '@nestjs/schedule';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { ReportAppStateDto } from 'src/report/dto/report.dto';
import { BusinessService } from 'src/business/business.service';
import moment from 'moment-timezone';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly onesignal: OneSignalService,
    private readonly businessService: BusinessService
  ) { }

  async createOpenAppNotification(reportAppStateDto: ReportAppStateDto, userId: number) {
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        type: NotificationType.OPEN_APP,
        deviceId: reportAppStateDto.deviceId,
      },
    });

    this.logger.log('create open app for user', userId);

    if (!existingNotification) {
      const numberOfMinutesForSchedule = 2;
      const scheduledAt = new Date();
      scheduledAt.setMinutes(scheduledAt.getMinutes() + numberOfMinutesForSchedule);

      await this.prisma.notification.create({
        data: {
          type: NotificationType.OPEN_APP,
          deviceId: reportAppStateDto.deviceId,
          businessId: reportAppStateDto.businessId,
          scheduledAt,
          userId
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

  @Interval(60000) // Make push notification in every mins
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
      const deviceIds = [];
      var schedules = {};

      for(const notification of existingNotification) {
        // Check if bussiness is still open or not
        const {userId, businessId} = notification;

        let schedule;

        if (!schedules[businessId]) {
          schedule = await this.businessService.getBusinessTodayScheduleById(userId, notification.businessId);
          schedules[businessId] = schedule;
        } else {
          schedule = schedules[businessId];
        }       
        
        this.logger.log('checking opening time for today', businessId);
        this.logger.log('shedule today', schedule);

        // If today is not enabled, do not make push notification
        if (!schedule.today.enabled) {
          this.logger.log('Business does not open today');
          return false;
        }

        this.logger.log('checking diff to decide make push notification');

        
        // Get current time in business timezone
        const now = moment().tz(schedule.timezone);

        let shouldPush = false;
        schedule.today.lapses.forEach(lapse => {
          const openTimeBusinessTimezone = moment.tz({ hour: lapse.open.hour, minute: lapse.open.minute }, schedule.timezone);
          const closeTimeBusinessTimezone = moment.tz({ hour: lapse.close.hour, minute: lapse.close.minute }, schedule.timezone);
          this.logger.log('opening time', openTimeBusinessTimezone);
          this.logger.log('closed time', closeTimeBusinessTimezone);
          this.logger.log('now', now);

          const openTimeDiff = openTimeBusinessTimezone.diff(now, 'minutes');
          const closeTimeDiff = closeTimeBusinessTimezone.diff(now, 'minutes');

          this.logger.log('openTimeDiff', openTimeDiff);
          this.logger.log('closeTimeDiff', closeTimeDiff);


          // If current time is inside the business time, we should make push notification
          if (openTimeDiff < 0 && closeTimeDiff > 0) {
            this.logger.log('Need to push');
            deviceIds.push(notification.deviceId);
            return true;
          }
        });
      }

      this.logger.log(`Make push notification to: ${JSON.stringify(deviceIds)}`);

      if (deviceIds.length > 0) {
        this.onesignal.pushOpenAppNotification(deviceIds)
      }
    }
  }
}
