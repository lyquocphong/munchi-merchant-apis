import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server, Socket } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { plainToClass } from 'class-transformer';
import { BusinessService } from 'src/business/business.service';
import { OrderDto } from 'src/order/dto/order.dto';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService {
  constructor(private business: BusinessService, private user: UserService) {}
  @WebSocketServer() server: Server;
  @WebSocketServer() orderingServer: Server;
  onModuleInit() {
    const ioServer = this.server;
    ioServer.on('connection', async (socket) => {
      socket.on('join', (room) => {
        socket.join(room);
      });
      socket.on('orders_register', function (order) {
        //if there is a new order do something
        console.log('Order register');
      });
      socket.on('update_order', function (order) {
        console.log('Order Updated');
        //if there is a change in an order do something
      });
    });
  }
  async newOrderNotification(order: any) {
    console.log('Order come');
    const business = await this.business.getBusinessById(order.business_id);
    const newOrderResponse = plainToClass(OrderDto, order);
    this.server.to(business.publicId).emit('new-order-notification', newOrderResponse);
    return 'Ok';
  }
  async orderStatusNotification(order: any) {
    console.log('Order status update');
    const business = await this.business.getBusinessById(order.business_id);
    const newOrderResponse = plainToClass(OrderDto, order);
    this.server.to(business.publicId).emit('order-status-change', newOrderResponse);
    return 'Ok';
  }
}
