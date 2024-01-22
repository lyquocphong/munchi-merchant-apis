import { ForbiddenException, Injectable } from '@nestjs/common';
import { ReminderScheduleBodyData } from './validation/schedule.validation';
import { PrismaService } from 'src/prisma/prisma.service';
import moment from 'moment';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronJobParameters } from 'cron';
import { Logger } from '@nestjs/common';
import { WebhookService } from 'src/webhook/webhook.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly webhookService: WebhookService,
    private readonly utisService: UtilsService,
  ) {}

  async setPreOrderReminder({ reminderTime, woltOrderId }: ReminderScheduleBodyData) {
    //Get order by order Id
    //Update reminder time
    const order = await this.prismaService.order.update({
      where: {
        id: parseInt(woltOrderId),
      },
      data: {
        preorder: {
          update: {
            reminderTime: reminderTime,
          },
        },
      },
      include: {
        business: true,
      },
    });
    // Convert the time to current restaurant timezone
    //Remove the Z at the end so moment don't convert that to utc time
    const convertToLocalTime = reminderTime.replace('Z', '');

    const cronExpression = this.isoToCronExpression(convertToLocalTime);

    const job = new CronJob(
      cronExpression,
      async () => {
        this.logger.warn(`This cron job ran at ${moment().format()}`);
        // Add your custom action here
        await this.webhookService.remindPreOrder(order);
      },
      null,
      null,
      order.business.timeZone, // Adjust the time zone accordingly
      null,
      //   true,
    );
    try {
      this.schedulerRegistry.addCronJob(woltOrderId, job);
      job.start();
    } catch (error: any) {
      return new ForbiddenException(error.message);
    }

    return 'success';
  }

  isoToCronExpression(isoTime: string): string | null {
    try {
      const date = moment(isoTime);
      const minutes = date.minutes();
      const hours = date.hours();
      const dayOfMonth = date.date();
      const month = date.month(); // Months are 0-based in moment.js
      console.log('🚀 ~ ScheduleService ~ isoToCronExpression ~ month:', month);
      const dayOfWeek = date.day();

      return `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
    } catch (error) {
      console.error('Error converting ISO to cron expression:', error);
      return null;
    }
  }

  async getReminder() {
    const allCrons = this.schedulerRegistry.getCronJobs();
    console.log('🚀 ~ ScheduleService ~ setPreOrderReminder ~ allCrons:', allCrons);
    return allCrons;
  }
}
