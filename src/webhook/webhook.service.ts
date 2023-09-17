import { NotificationService } from './../notification/notification.service';
/* eslint-disable prettier/prettier */
import { ForbiddenException, Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server } from 'socket.io';
import { BusinessService } from 'src/business/business.service';
import { UtilsService } from 'src/utils/utils.service';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService implements OnModuleInit {
  @WebSocketServer() public server: Server;
  constructor(
    @Inject(forwardRef(() => BusinessService)) private business: BusinessService,
    private utils: UtilsService,
    private notificationService: NotificationService
  ) { }

  onModuleInit() {
    const ioServer = this.server;

    ioServer.on('connection', (socket) => {
      socket.on('join', async (room: string) => {
        console.log(`Try to join room ${room}`);
        const business = await this.business.findBusinessByPublicId(room);
        if (!business) {
          console.log(`No business found for ${room}`);
          // throw new ForbiddenException(403, `No business found for ${room}`);
        } else {
          socket.join(business.orderingBusinessId.toString());
        }
      });

      socket.on('leave', async (room: string) => {
        console.log(`Try to leave room ${room}`);
        const business = await this.business.findBusinessByPublicId(room);
        if (!business) {
          console.log(`No business found for ${room}`);
          //throw new ForbiddenException(403, `No business found for ${room}`);
        } else {
          socket.leave(business.orderingBusinessId.toString());
        }
      });

      /**
       * Notify when new order popup is closed and server emit event
       * back for other apps if avaiable to close the popup for same order
       */
      socket.on('order-popup-closed', async (orderId: string, businessId: string) => {
        this.server.to(businessId).emit('close-order-popup', orderId);
      })
    });
  }

  async newOrderNotification(order: any) {
    try {
      this.server.to(order.business_id.toString()).emit('orders_register', order);
      this.notificationService.sendNewOrderNotification(order.business_id);
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

  async notifyCheckBusinessStatus(businessPublicId: string) {
    const business = await this.business.findBusinessByPublicId(businessPublicId);
    console.log(`emit business_status_change because of ${businessPublicId}`);
    const message = `${business.name} status changed`;
    this.server.to(business.orderingBusinessId.toString()).emit('business_status_change', message);
  }
}
