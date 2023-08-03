// notification/notification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification.type';
import { Interval } from '@nestjs/schedule';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { ReportAppStateDto } from 'src/report/dto/report.dto';
import { BusinessService } from 'src/business/business.service';
import moment from 'moment-timezone';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly onesignal: OneSignalService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService
  ) { }

  async createOpenAppNotification(reportAppStateDto: ReportAppStateDto, userId: number) {
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        type: NotificationType.OPEN_APP,
        deviceId: reportAppStateDto.deviceId,
      },
    });

    this.logger.warn(`In service: create open app notification for user ${userId}, deviceId: ${reportAppStateDto.deviceId}` );

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

    this.logger.warn(`In service: remove open app notification for device: ${deviceId}` );

    await this.prisma.notification.deleteMany({
      where: {
        type: NotificationType.OPEN_APP,
        deviceId: deviceId,
      },
    });
  }

  @Interval(60000) // Make push notification in every mins
  async createOpenAppPushNotification() {

    const ignore = this.configService.get<boolean>('IGNORE_SENDING_OPEN_APP_NOTIFICATION');

    if (ignore) {
      this.logger.log('Ignore the open app notification cron');
      return;  
    }

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
        
        // If today is not enabled, do not make push notification
        if (!schedule.today.enabled) {         
          return false;
        }

        
        // Get current time in business timezone
        const now = moment().tz(schedule.timezone);

        let shouldPush = false;
        schedule.today.lapses.forEach(lapse => {
          const openTimeBusinessTimezone = moment.tz({ hour: lapse.open.hour, minute: lapse.open.minute }, schedule.timezone);
          const closeTimeBusinessTimezone = moment.tz({ hour: lapse.close.hour, minute: lapse.close.minute }, schedule.timezone);          
          const openTimeDiff = openTimeBusinessTimezone.diff(now, 'minutes');
          const closeTimeDiff = closeTimeBusinessTimezone.diff(now, 'minutes');


          // If current time is inside the business time, we should make push notification
          if (openTimeDiff < 0 && closeTimeDiff > 0) {
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
