import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets/decorators';
import { Response } from 'express';
import { AuthCredentials } from 'src/type';
import axios from 'axios';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { WsResponse } from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
@Injectable()
export class OrderWebhookService {
  @WebSocketServer() server: Server;
  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`${socket.id} connected`);
    });
  }
  constructor(private prisma: PrismaService) {}
  @SubscribeMessage('orders')
  newOrder(@MessageBody() body: any, socket: Socket) {
    // const user = this.

    this.server.emit('newOrder', body); //sending to client
    const data = JSON.parse(body);
  }
  newOrderReciever(request) {
    console.log(request);
    return 'webhook order';
  }
}
