import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthCredentials } from 'src/ts';

const axios = require('axios');
@Injectable()
export class OrderWebhookService {
  newOrder() {
    return 'webhook order';
  }
  newOrderReciever(request) {
    console.log(request)
    return 'webhook order';
  }
}