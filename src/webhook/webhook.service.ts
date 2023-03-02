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
export class OrderWebhookService {
  constructor( private business: BusinessService) {}
  @WebSocketServer() server: Server;
  onModuleInit() {
    const ioServer = this.server;
    ioServer.on('connection', async (socket) => {
      // const publicUserId = socket.handshake.auth.publicUserId;
      console.log(`${socket.id} connected`);
      // console.log(socket.handshake.auth.publicUserId);
      // const userId = socket.handshake.auth.publicUserId;
      // if (userId) {
      //   const user = await this.user.getUser(null, socket.handshake.auth.publicUserId);
      //   socket.to(userId).emit('private message');
      //   console.log(user);
      // } else {
      //   console.log('Loading');
      // }
      console.log(socket.rooms);
      socket.on('join', (room) => {
        socket.join(room);
        console.log(socket.rooms, 'line 38');
        console.log(room, 'Joining this shitty room');
      });
      console.log(socket.rooms, 'line 42');
    });
  }
  // OnGatewayConnection() {
  //   this.server.use(async (socket, next) => {
  //     const publicUserId = socket.handshake.auth.publicUserId;
  //     if (publicUserId) {
  //       // find existing session
  //       const user = await this.user.getUser(null, publicUserId);
  //       if (user) {
  //         console.log(user, 'line 35 middleware ');
  //         return next();
  //       }
  //     }

  //     // const username = socket.handshake.auth.username;
  //     // if (!username) {
  //     //   return next(new Error("invalid username"));
  //     // }
  //     // // create new session
  //     // socket.sessionID = randomId();
  //     // socket.userID = randomId();
  //     // socket.username = username;
  //     next();
  //   });
  // }
 async newOrder(order:any) {
    console.log(order.businessId)
    const business = await this.business.getBusinessById(order.businessId)
    console.log(business)
    this.server
      .to(business.publicId)
      .emit('receive-order', order);
  }
}
