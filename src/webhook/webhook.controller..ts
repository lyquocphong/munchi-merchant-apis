import { HttpService } from '@nestjs/axios';
import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Request } from 'express';
import { UtilsService } from 'src/utils/utils.service';
import { OrderWebhookService } from './webhook.service';
@Controller('webhook')
export class OrderWebhookController {
  constructor(
    private OrderWebhookService: OrderWebhookService,
    private readonly httpService: HttpService,
    private utils: UtilsService,
  ) {}

  @Post('new')
  newOrderReciever(@Req() request: Request) {
    return this.OrderWebhookService.newOrderReciever(request);
  }
}
