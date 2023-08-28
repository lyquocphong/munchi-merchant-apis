import { WebhookService } from './../webhook/webhook.service';
import { ActiveStatusQueue, Prisma } from '@prisma/client';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Interval } from '@nestjs/schedule';
import moment from 'moment';
import { BusinessService } from 'src/business/business.service';

@Injectable()
export class QueueService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly webhookService: WebhookService,
    @Inject(forwardRef(() => BusinessService)) private businessService: BusinessService,
  ) {}

  async upsertActiveStatusQueue(
    data: Prisma.ActiveStatusQueueCreateInput,
  ): Promise<ActiveStatusQueue> {
    return this.prismaService.activeStatusQueue.upsert({
      where: {
        businessPublicId: data.businessPublicId,
      },
      create: data,
      update: data,
    });
  }

  async removeActiveStatusQueue(businessPublicId: string) {
    return this.prismaService.activeStatusQueue.deleteMany({
      where: {
        businessPublicId,
      },
    });
  }

  @Interval(60000) // Make push notification in every mins
  async activeBusinessStatus() {
    // 1. Get queue
    const now = moment.utc();
    console.log('now', now.toISOString());
    const from = now.subtract(1, 'minutes');
    console.log('from', from.toISOString());

    const items = await this.prismaService.activeStatusQueue.findMany({
      where: {
        time: {
          lt: now.toDate(),
        },
        processing: false,
      },
      take: 10,
    });

    console.log(`active queue items: ${items.length}`);

    if (items.length == 0) {
      console.log('Items is empty, return');
      return;
    }

    const ids = items.map((item) => item.id);

    // Set processing to true to prevent duplicate handling
    await this.prismaService.activeStatusQueue.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        processing: true,
      },
    });

    for (const item of items) {
      const { userPublicId, businessPublicId } = item;
      await this.businessService.setOnlineStatusByPublicId(userPublicId, businessPublicId, true);
      this.webhookService.notifyCheckBusinessStatus(businessPublicId);
    }
  }
}
