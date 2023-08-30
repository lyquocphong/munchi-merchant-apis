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
import { SessionService } from 'src/auth/session.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly onesignal: OneSignalService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  @Interval(60000) // Make push notification in every mins
  async createOpenAppPushNotification() {
    const ignore = this.configService.get<boolean>('IGNORE_SENDING_OPEN_APP_NOTIFICATION');

    if (ignore) {
      this.logger.log('Ignore the open app notification cron');
      return;
    }

    // Get all offline session
    const offlineSessions = await this.sessionService.getOfflineSession();

    if (offlineSessions.length == 0) {
      this.logger.log('Do not need to make any push notification');
      return;
    }

    const deviceIds = [];
    const schedules = {};
    for (const session of offlineSessions) {
      for (const business of session.businesses) {
        const { publicId: businessId } = business;

        let schedule;

        if (!schedules[businessId]) {
          schedule = await this.businessService.getBusinessTodayScheduleById(
            session.user.orderingUserId,
            businessId,
          );
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

        schedule.today.lapses.forEach((lapse) => {
          const openTimeBusinessTimezone = moment.tz(
            { hour: lapse.open.hour, minute: lapse.open.minute },
            schedule.timezone,
          );
          const closeTimeBusinessTimezone = moment.tz(
            { hour: lapse.close.hour, minute: lapse.close.minute },
            schedule.timezone,
          );
          const openTimeDiff = openTimeBusinessTimezone.diff(now, 'minutes');
          const closeTimeDiff = closeTimeBusinessTimezone.diff(now, 'minutes');

          // If current time is inside the business time, we should make push notification
          if (openTimeDiff < 0 && closeTimeDiff > 0) {
            deviceIds.push(session.deviceId);
          }
        });
      }
    }

    this.logger.log(`Make push notification to: ${JSON.stringify(deviceIds)}`);

    if (deviceIds.length > 0) {
      this.onesignal.pushOpenAppNotification([...new Set(deviceIds)]);
    }
  }
}
