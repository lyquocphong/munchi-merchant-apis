import { WebhookService } from './../webhook/webhook.service';
// notification/notification.service.ts

import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { BusinessService } from 'src/business/business.service';
import moment from 'moment-timezone';
import { SessionService } from 'src/auth/session.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly onesignal: OneSignalService,
    private readonly sessionService: SessionService,
    @Inject(forwardRef(() => BusinessService)) private businessService: BusinessService,
    @Inject(forwardRef(() => WebhookService)) private webhookService: WebhookService,
  ) {}

  async sendNewOrderNotification(orderingBusinessId: number) {
    this.logger.warn('Send new order push notification');

    const business = await this.businessService.findBusinessByOrderingId(orderingBusinessId, {
      include: {
        sessions: true,
      },
    });

    if (!business) {
      return;
    }

    const deviceIds = [];
    for (const session of business.sessions) {
      deviceIds.push(session.deviceId);
    }

    this.logger.warn(`Make new order push notification to: ${deviceIds}`);

    if (deviceIds.length > 0) {
      this.onesignal.pushNewOrderNotification([...new Set(deviceIds)]);
    }
  }

  @Interval(60000) // Make push notification in every mins
  async createOpenAppPushNotification() {
    this.logger.warn('Send open app push notification');
    // Get all offline session
    const offlineSessions = await this.sessionService.getOfflineSession();

    if (offlineSessions.length == 0) {
      this.logger.warn('Do not need to make any push notification');
      return;
    }

    const sessionIds = offlineSessions.map((session) => session.id);
    this.logger.warn('Checking push notification for session '.concat(JSON.stringify(sessionIds)));

    await this.sessionService.setOpenAppNotificationSending(true, sessionIds);

    const sendingSessionIds = [];
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

        this.logger.warn(`Business ${schedule.name} has schedule ${JSON.stringify(schedule)}`);

        // If today is not enabled, do not make push notification
        if (!schedule.today.enabled) {
          this.logger.warn(`Business ${schedule.name} does not enabled for today`);

          return false;
        }

        // Get current time in business timezone
        const now = moment.utc().tz(schedule.timezone);
        this.logger.warn(`Checking Business ${schedule.name} now ${now}`);

        schedule.today.lapses.forEach((lapse) => {
          const openTimeBusinessTimezone = moment
            .utc()
            .tz(schedule.timezone)
            .set({ hour: lapse.open.hour, minute: lapse.open.minute });

          const closeTimeBusinessTimezone = moment
            .utc()
            .tz(schedule.timezone)
            .set({ hour: lapse.close.hour, minute: lapse.close.minute });

          const openTimeDiff = openTimeBusinessTimezone.diff(
            moment.utc().tz(schedule.timezone),
            'minutes',
          );
          const closeTimeDiff = closeTimeBusinessTimezone.diff(
            moment.utc().tz(schedule.timezone),
            'minutes',
          );

          this.logger.warn(
            `Business ${schedule.name} openTimeBusinessTimezone ${openTimeBusinessTimezone} , closeTimeBusinessTimezone ${closeTimeBusinessTimezone}`,
          );

          this.logger.warn(
            `Business ${schedule.name} openTimeDiff ${openTimeDiff} , closeTimeDiff ${closeTimeDiff}`,
          );

          // If current time is inside the business time, we should make push notification
          if (openTimeDiff < 0 && closeTimeDiff > 0) {
            deviceIds.push(session.deviceId);
            sendingSessionIds.push(session.id);
          } else {
            this.logger.warn(`Business ${schedule.name} is not open now`);
          }
        });
      }
    }

    this.logger.warn(`Make push notification to: ${JSON.stringify(deviceIds)}`);

    if (deviceIds.length > 0) {
      this.onesignal.pushOpenAppNotification([...new Set(deviceIds)]);
      await this.sessionService.incrementOpenAppNotificationCount(sendingSessionIds);
    }

    await this.sessionService.setOpenAppNotificationSending(false, sessionIds);
  }

  // @Interval(30000) // Emit update app state
  // async emitUpdateAppState() {
  //   this.logger.warn('emit update app state');

  //   const sessions = await this.sessionService.getSessionToEmitUpdateAppState();

  //   if (sessions.length == 0) {
  //     this.logger.warn('no session need to emit update app state');
  //   }

  //   for (const session of sessions) {
  //     this.logger.warn(`emit update app state for ${session.deviceId}`);
  //     this.webhookService.emitUpdateAppState(session.deviceId);
  //   }
  // }
}
