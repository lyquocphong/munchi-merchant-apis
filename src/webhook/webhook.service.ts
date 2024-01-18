import { NotificationService } from './../notification/notification.service';
/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Business } from '@prisma/client';
import { Server } from 'socket.io';
import { BusinessService } from 'src/business/business.service';
import { WoltService } from 'src/provider/wolt/wolt.service';
import { WoltOrderNotification } from 'src/provider/wolt/wolt.type';
import { UtilsService } from 'src/utils/utils.service';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService implements OnModuleInit {
  private readonly logger = new Logger(WebhookService.name);
  @WebSocketServer() public server: Server;
  constructor(
    @Inject(forwardRef(() => BusinessService)) private businessService: BusinessService,
    private utils: UtilsService,
    private notificationService: NotificationService,
    private woltService: WoltService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const ioServer = this.server;

    ioServer.on('connection', (socket) => {
      socket.on('join', async (room: string) => {
        this.logger.warn(`Try to join room ${room}`);
        const business = await this.businessService.findBusinessByPublicId(room);
        if (!business) {
          this.logger.error(`No business found for ${room}`);
          // throw new ForbiddenException(403, `No business found for ${room}`);
        } else {
          this.logger.warn(`join ${room} and business is ${business.name}`);
          socket.join(business.orderingBusinessId.toString());
        }
        console.log(socket.rooms)
      });

      socket.on('leave', async (room: string) => {
        this.logger.warn(`Try to leave room ${room}`);
        const business = await this.businessService.findBusinessByPublicId(room);
        if (!business) {
          this.logger.error(`No business found for ${room}`);
          //throw new ForbiddenException(403, `No business found for ${room}`);
        } else {
          this.logger.warn(`leave ${room} and business is ${business.name}`);
          socket.leave(business.orderingBusinessId.toString());
        }
      });

      /**
       * Notify when new order popup is closed and server emit event
       * back for other apps if avaiable to close the popup for same order
       */
      socket.on('order-popup-closed', async (orderId: string, businessId: string) => {
        this.server.to(businessId).emit('close-order-popup', orderId);
      });
    });
  }

  async emitUpdateAppState(deviceId: string) {
    this.server.emit('update-app-state', deviceId);
  }

  async newOrderNotification(order: any) {
    try {
      this.server.to(order.business_id.toString()).emit('orders_register', order);
      this.notificationService.sendNewOrderNotification(order.business_id.toString());
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async changeOrderNotification(order: any) {
    try {
      this.server.to(order.business_id.toString()).emit('order_change', order);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async newWoltOrderNotification(woltWebhookdata: WoltOrderNotification) {
    if (
      woltWebhookdata.order.status === 'CREATED' &&
      woltWebhookdata.type === 'order.notification'
    ) {
      const woltOrder = await this.woltService.getOrderDataAndSaveToDb(woltWebhookdata);
      const business = await this.businessService.findBusinessByWoltVenueid(
        woltWebhookdata.order.venue_id,
      );
      try {
        // Emit to client by public business id
        this.logger.log(`emit order created because of ${business.publicId}`);
        this.server.to(business.orderingBusinessId).emit('orders_register', woltOrder);
        return 'Order sent';
      } catch (error) {
        this.utils.logError(error);
      }
      return `Order ${woltWebhookdata.order.status.toLocaleLowerCase()}`;
    } else {
      await this.woltService.syncWoltOrder(woltWebhookdata.order.id);
    }
  }

  async notifyCheckBusinessStatus(businessPublicId: string) {
    const business = await this.businessService.findBusinessByPublicId(businessPublicId);
    this.logger.warn(`emit business_status_change because of ${businessPublicId}`);
    const message = `${business.name} status changed`;
    this.server.to(business.orderingBusinessId).emit('business_status_change', message);
  }

  async remindPreOrder(order: any) {
    const business: Business = order.business;
    console.log("🚀 ~ WebhookService ~ remindPreOrder ~ business:", business)
    console.log(typeof business.orderingBusinessId)
    const message = `It's time for you to prepair order ${order.id}`;
    this.server.to(business.orderingBusinessId).emit('preorder', message);

    this.logger.warn(`cron notify preorder reminder complete ${business.publicId}`);
    // this.schedulerRegistry.deleteCronJob(order.id);
  }
  // @Cron(CronExpression.EVERY_10_SECONDS)
  // async sendPreOrderReminder() {
  //   console.log()
  // }
}
