import { NotificationService } from './../notification/notification.service';
/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Business, Order } from '@prisma/client';
import { Server } from 'socket.io';
import { BusinessService } from 'src/business/business.service';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { OrderingOrder, OrderingOrderStatus } from 'src/provider/ordering/ordering.type';
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
    private orderingService: OrderingService,
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

  async newOrderNotification(order: OrderingOrder) {
    const formattedOrder = await this.orderingService.mapOrderToOrderResponse(order);
    try {
      this.server.to(order.business_id.toString()).emit('orders_register', formattedOrder);
      this.notificationService.sendNewOrderNotification(order.business_id.toString());
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async changeOrderNotification(order: OrderingOrder) {
    const message = `It's time for you to prepair order ${order.id}`;
    const formattedOrder = await this.orderingService.mapOrderToOrderResponse(order);
    if (
      order.status === OrderingOrderStatus.Pending &&
      order.reporting_data.at.hasOwnProperty(`status:${OrderingOrderStatus.Preorder}`)
    ) {
      this.server.to(order.business_id.toString()).emit('preorder', message);
    } else {
      try {
        this.server.to(order.business_id.toString()).emit('order_change', formattedOrder);
      } catch (error) {
        this.utils.logError(error);
      }
    }
  }

  async woltOrderNotification(woltWebhookdata: WoltOrderNotification) {
    // Get order data from Wolt
    const woltOrder = await this.woltService.getOrderById(woltWebhookdata.order.id);

    //Mapped wolt response to general order response
    const formattedWoltOrder = await this.woltService.mapOrderToOrderResponse(woltOrder);

    //Find business by venue Id
    const business = await this.businessService.findBusinessByWoltVenueid(
      woltWebhookdata.order.venue_id,
    );

    if (
      woltWebhookdata.order.status === 'CREATED' &&
      woltWebhookdata.type === 'order.notification'
    ) {
      await this.woltService.saveWoltOrder(formattedWoltOrder);

      try {
        // Emit to client by public business id
        this.logger.log(`emit order created because of ${business.publicId}`);
        this.server.to(business.orderingBusinessId).emit('orders_register', formattedWoltOrder);
        return 'Order sent';
      } catch (error) {
        this.utils.logError(error);
      }
      return `Order ${woltWebhookdata.order.status.toLocaleLowerCase()}`;
    } else if ( woltWebhookdata.order.status === 'PRODUCTION' || woltWebhookdata.order.status !== 'DELIVERED'){
      const orderSynced: Order = await this.woltService.syncWoltOrder(woltWebhookdata.order.id);
      this.server.to(business.orderingBusinessId).emit('notification', {
        orderId: orderSynced.id,
        status: woltWebhookdata.order.status,
      });
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
    const message = `It's time for you to prepair order ${order.id}`;
    this.server.to(business.orderingBusinessId).emit('preorder', message);

    this.logger.warn(`cron notify preorder reminder complete ${business.publicId}`);
    // this.schedulerRegistry.deleteCronJob(order.id);
  }
}
