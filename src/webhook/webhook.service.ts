import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server, Socket } from 'socket.io';
import * as io from 'socket.io-client';
import { BusinessService } from 'src/business/business.service';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService implements OnModuleInit {
  @WebSocketServer() public server: Server;
  public socketIoClient: Socket;
  public project: string;
  constructor(
    private business: BusinessService,
    private user: UserService,
    private ordering: OrderingIoService,
    private config: ConfigService,
  ) {
    this.project = this.config.get('PROJECT_NAME');
  }

  onModuleInit() {
    const ioServer = this.server;
    ioServer.on('connection', (socket) => {
      socket.on('join', (room) => {
        socket.join(room);
      });
      // const authReponse = await this.ordering.signIn({
      //   email: `${this.config.get('ADMIN_EMAIL')}`,
      //   password: `${this.config.get('ADMIN_PASSWORD')}`,
      // });
      // //login with
      // if (!socket.handshake.auth.publicBusinessId) {
      //   return 'Something wrong happened';
      // }
      // const business = await this.business.getBusinessByPublicId(
      //   socket.handshake.auth.publicBusinessId,
      // );
      // const user = await this.user.getUserByUserId(business.userId);
      // if (!user || !business) {
      //   return 'Something wrong happened';
      // }
      // this.socketIoClient = io.connect(`${this.config.get('SOCKET_URL')}`, {
      //   query: {
      //     token: authReponse.session.accessToken,
      //     project: this.project,
      //   },
      //   transports: ['websocket'],
      // });

      // this.socketIoClient.on('error', () => {
      //   console.log('Sorry, there seems to be an issue with the connection!');
      // });

      // this.socketIoClient.on('connect_error', async (err) => {
      //   console.log('connect failed ' + err);
      //   const newAuthReponse = await this.ordering.signIn({
      //     email: `${this.config.get('ADMIN_EMAIL')}`,
      //     password: `${this.config.get('ADMIN_PASSWORD')}`,
      //   });
      //   this.socketIoClient = io.connect(`${this.config.get('SOCKET_URL')}`, {
      //     query: {
      //       token: newAuthReponse.session.accessToken,
      //       project: this.project,
      //     },
      //     transports: ['websocket'],
      //   });
      // });
      // this.socketIoClient.on('connect', () => {
      //   const userOrderRoom = `${this.project}_orders_${user.userId}`;
      //   const userOrderMessageRoom = `${this.project}_messages_orders_${user.userId}`;
      //   const driverRoom = `${this.project}_drivers`;
      //   const orderRoom = `${this.project}_orders`;
      //   const orderMessageRoom = `${this.project}_messages_orders`;

      //   console.log('on connect to ordering server');
      //   console.log(this.socketIoClient.id, 'connecting to order server');
      //   this.socketIoClient.emit('join', orderRoom);
      //   this.socketIoClient.emit('join', userOrderRoom);
      //   // this.socketIoClient.emit('join', userOrderMessageRoom);
      //   this.socketIoClient.emit('join', orderRoom);
      //   this.socketIoClient.emit('join', {
      //     room: 'orders',
      //     user_id: user.userId,
      //     role: 'manager',
      //     project: this.project,
      //   });
      //   // this.socketIoClient.emit('join', driverRoom);
      //   // this.socketIoClient.emit('join', orderMessageRoom);
      //   this.socketIoClient.on('message', function (order) {
      //     //if there is a change in an order do something
      //     console.log('message order ', order);
      //   });
      //   this.socketIoClient.on('update_order', function (order) {
      //     //if there is a change in an order do something
      //     if (order.business_id === business.businessId) {
      //       ioServer.emit('order_change', order);
      //     }
      //     return 'Something wrong happened';
      //   });
      //   this.socketIoClient.on('orders_register', function (order) {
      //     //if there is a new order do something
      //     if (order.business_id === business.businessId) {
      //       ioServer.emit('orders_register', order);
      //     }
      //     return 'Something wrong happened';
      //   });
      //   this.socketIoClient.on('order_change', function (order) {
      //     //if there is a change in an order do something
      //     console.log('change order line 89', order);
      //   });
      // });
    });
  }
  async newOrderNotification(order: any) {
    const business = await this.business.getBusinessById(order.business_id);
    if (!business) {
      return 'Something wrong happened';
    } else {
      this.server.to(business.publicId).emit('orders_register', order);
    }
  }
  async changeOrderNotification(order: any) {
    console.log('Order status change')
    const business = await this.business.getBusinessById(order.business_id);
    if (!business) {
      return 'Something wrong happened';
    } else {
      this.server.to(business.publicId).emit('order_change', order);
    }
  }
}
