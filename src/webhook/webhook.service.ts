/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server } from 'socket.io';
import { BusinessService } from 'src/business/business.service';
import { OneSignalService } from 'src/one-signal/one-signal.service';
import { UtilsService } from 'src/utils/utils.service';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService implements OnModuleInit {
  @WebSocketServer() public server: Server;
  constructor(
    private business: BusinessService,
    private utils: UtilsService,
    private oneSignalService: OneSignalService,
  ) {}

  onModuleInit() {
    const ioServer = this.server;

    ioServer.on('connection', (socket) => {
      socket.on('join', async (room: string) => {
        const business = await this.business.findBusinessByPublicId(room);
        if (!business) {
          throw new ForbiddenException(403, 'No business found');
        } else {
          socket.join(business.businessId.toString());
        }
      });
    });
  }

  async newOrderNotification(order: any) {
    try {
      this.oneSignalService.createNotification(order)
      this.server.to(order.business_id.toString()).emit('orders_register', order);
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
}
