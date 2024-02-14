import { Inject, Injectable, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { PreorderQueue } from '@prisma/client';
import { Server } from 'socket.io';
import { BusinessService } from 'src/business/business.service';
import { OrderStatusEnum } from 'src/order/dto/order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { OrderingOrder, OrderingOrderStatus } from 'src/provider/ordering/ordering.type';
import { ProviderEnum } from 'src/provider/provider.type';
import { WoltService } from 'src/provider/wolt/wolt.service';
import { WoltOrderNotification, WoltOrderType } from 'src/provider/wolt/wolt.type';
import { QueueService } from 'src/queue/queue.service';
import { UtilsService } from 'src/utils/utils.service';
import { NotificationService } from './../notification/notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
  path: '/socket.io',
  pingInterval: 60000,
})
@Injectable()
export class WebhookService implements OnModuleInit {
  private readonly logger = new Logger(WebhookService.name);
  @WebSocketServer() public server: Server;
  constructor(
    @Inject(forwardRef(() => BusinessService)) private businessService: BusinessService,
    @Inject(forwardRef(() => QueueService)) private queueService: QueueService,
    private utils: UtilsService,
    private notificationService: NotificationService,
    private woltService: WoltService,
    private orderingService: OrderingService,
    private prismaService: PrismaService,
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

      socket.on('ping', async (data: string) => {
        this.logger.log(`Event emiited from user ${data}`);
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
    const formattedOrder = await this.orderingService.mapOrderToOrderResponse(order);
    if (
      order.status === OrderingOrderStatus.Pending &&
      order.reporting_data.at.hasOwnProperty(`status:${OrderingOrderStatus.Preorder}`)
    ) {
      return;
    } else {
      try {
        this.server.to(order.business_id.toString()).emit('order_change', formattedOrder);
      } catch (error) {
        this.utils.logError(error);
      }
    }
  }

  async woltOrderNotification(woltWebhookdata: WoltOrderNotification) {
    const venueId = woltWebhookdata.order.venue_id;

    // Get order data from Wolt
    const woltOrder = await this.woltService.getOrderById(woltWebhookdata.order.id, venueId);

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
        // Emit to client by public business id new order has been created
        this.logger.log(`emit order created because of ${business.publicId}`);
        this.server.to(business.orderingBusinessId).emit('orders_register', formattedWoltOrder);
        this.notificationService.sendNewOrderNotification(business.orderingBusinessId);

        return 'Order sent';
      } catch (error) {
        this.utils.logError(error);
      }
      return `Order ${woltWebhookdata.order.status.toLocaleLowerCase()}`;
    } else {
      // Notify up update client UI
      const orderSynced = await this.woltService.syncWoltOrder(woltWebhookdata.order.id, venueId);

      if (
        formattedWoltOrder.type === WoltOrderType.PreOrder &&
        formattedWoltOrder.status === OrderStatusEnum.IN_PROGRESS
      ) {
        await this.queueService.validatePreorderQueue(orderSynced.id);
      }

      if (woltWebhookdata.order.status === 'DELIVERED') {
        this.logger.log(`latest order: ${JSON.stringify(woltOrder)}`);
      }

      this.server.to(business.orderingBusinessId).emit('order_change', formattedWoltOrder);
    }
  }

  async notifyCheckBusinessStatus(businessPublicId: string) {
    const business = await this.businessService.findBusinessByPublicId(businessPublicId);
    this.logger.warn(`emit business_status_change because of ${businessPublicId}`);
    const message = `${business.name} status changed`;
    this.server.to(business.orderingBusinessId).emit('business_status_change', message);
  }

  async remindPreOrder({ businessPublicId, orderId, provider }: PreorderQueue) {
    const business = await this.businessService.findBusinessByPublicId(businessPublicId);

    //Get munchi api key
    const orderingApiKey = await this.prismaService.apiKey.findFirst({
      where: {
        name: 'ORDERING_API_KEY',
      },
    });

    let order: any;
    if (provider === ProviderEnum.Wolt) {
      order = await this.woltService.getOrderByIdFromDb(orderId.toString());
    } else {
      const orderingOrder = await this.orderingService.getOrderById(
        '',
        orderId.toString(),
        orderingApiKey.value,
      );
      order = await this.orderingService.mapOrderToOrderResponse(orderingOrder);
    }
    const message = `It's time for you to prepare order ${order.orderNumber}`;
    this.server.to(business.orderingBusinessId).emit('preorder', {
      message: message,
      order: order,
    });

    this.logger.warn(`cron notify preorder reminder complete ${business.publicId}`);
    // this.schedulerRegistry.deleteCronJob(order.id);
  }
}
