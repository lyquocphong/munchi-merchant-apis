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

import { WsResponse } from '@nestjs/websockets';
import { Body } from '@nestjs/common/decorators';
import { BusinessService } from 'src/business/business.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
@Injectable()
export class WebhookService {
  constructor( private business: BusinessService) {}
  @WebSocketServer() server: Server;
  onModuleInit() {
    const ioServer = this.server;
    ioServer.on('connection', async (socket) => {
      console.log(`${socket.id} connected`);
      console.log(socket.rooms);
      socket.on('join', (room) => {
        socket.join(room);
        console.log(socket.rooms, 'line 38');
        console.log(room, 'Joining this shitty room');
      });
      console.log(socket.rooms, 'line 42');
    });
  }
 async newOrder(order:any) {
    console.log(order.businessId)
    const business = await this.business.getBusinessById(order.businessId)
    console.log(business)
    this.server
      .to(business.publicId)
      .emit('receive-order', order);
  }
}
