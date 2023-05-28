import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server, Socket } from 'socket.io';
import { BusinessService } from 'src/business/business.service';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService implements OnModuleInit {
  @WebSocketServer() public server: Server;
  public socketIoClient: Socket;
  public project: string;
  constructor(private business: BusinessService, private config: ConfigService) {
    this.project = this.config.get('PROJECT_NAME');
  }

  onModuleInit() {
    const ioServer = this.server;

    ioServer.on('connection', (socket) => {
      socket.on('join', (room) => {
        socket.join(room);
      });
    });
  }
  async newOrderNotification(order: any) {
    const business = await this.business.findBusinessById(order.business_id);

    if (!business) {
      throw new ForbiddenException('Please provide a business id');
    } else {
      this.server.to(business.publicId).emit('orders_register', order);
    }
  }
  async changeOrderNotification(order: any) {
    const business = await this.business.findBusinessById(order.business_id);

    if (!business) {
      throw new ForbiddenException('Please provide a business id');
    } else {
      this.server.to(business.publicId).emit('order_change', order);
    }
  }
}
