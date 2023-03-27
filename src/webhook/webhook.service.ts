import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets/decorators';
import { Server, Socket } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { plainToClass } from 'class-transformer';
import { BusinessService } from 'src/business/business.service';
import { OrderDto } from 'src/order/dto/order.dto';
import { UserService } from 'src/user/user.service';
import * as io from 'socket.io-client';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: { origin: '*' } } })
@Injectable()
export class WebhookService implements OnModuleInit {
  @WebSocketServer() public server: Server;
  public socketIoClient: Socket;
  public project: string;
  constructor(
    private business: BusinessService,
    private user: UserService,
    private config: ConfigService,
  ) {
    this.project = this.config.get('PROJECT_NAME');
  }

  onModuleInit() {
    const ioServer = this.server;
    ioServer.on('connection', async (socket) => {
      console.log(socket.id, 'connected');

      const user = await this.user.getUserByPublicId(socket.handshake.auth.publicUserId);
      this.socketIoClient = io.connect(`${this.config.get('SOCKET_URL')}`, {
        query: {
          token: user.session.accessToken,
          project: this.project,
        },
        transports: ['websocket'],
      });

      this.socketIoClient.on('error', () => {
        console.log('Sorry, there seems to be an issue with the connection!');
      });

      this.socketIoClient.on('connect_error', (err) => {
        console.log('connect failed ' + err);
      });
      this.socketIoClient.on('connect', () => {
        // const orderRoom = `${this.project}_orders`;
        const userOrderRoom = `${this.project}_orders_${user.userId}`;
        const driverRoom = `${this.project}_drivers`;
        const orderMessageRoom = `${this.project}_messages_orders`;
        const userOrderMessageRoom = `${this.project}_messages_orders_${user.userId}`;
        console.log('on connect to ordering server');
        console.log(this.socketIoClient.id, 'connecting to order server');
        // this.socketIoClient.emit('join', orderRoom);
        this.socketIoClient.emit('join', userOrderRoom);
        this.socketIoClient.emit('join', userOrderMessageRoom);
        this.socketIoClient.emit('join', {
          room: 'orders',
          user_id: user.userId,
          role: 'manager',
          project: this.project,
        });
        // this.socketIoClient.emit('join', driverRoom);
        // this.socketIoClient.emit('join', orderMessageRoom);
        this.server.emit('newOrder', 'hello');
        this.socketIoClient.on('message', function (order) {
          //if there is a change in an order do something
          console.log('message order ', order);
        });
        this.socketIoClient.on('update_order', function (order) {
          //if there is a change in an order do something
          console.log('updating order: line 73 ');
        });
        this.socketIoClient.on('orders_register', function (order) {
          //if there is a new order do something
          console.log('new order ', order);
        });
        this.socketIoClient.on('order_change', function (order) {
          //if there is a change in an order do something
          console.log('change order line 89', order);
          ioServer.emit('order_change', order)
        });
      });
    });

  }
}
