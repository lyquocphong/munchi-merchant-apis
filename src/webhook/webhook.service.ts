import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthCredentials } from 'src/type';

const axios = require('axios');
@Injectable()
export class OrderWebhookService {
  newOrder(data) {
    console.log(`this is new order`);
    return data;
  }
  newOrderReciever(request) {
    console.log(request)
    return 'webhook order';
  }
}