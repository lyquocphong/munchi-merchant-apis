import { Body, Injectable } from '@nestjs/common';
import { OrderId } from 'src/ts';

@Injectable()
export class OrderService {
  async getAllOrders() {
    const axios = require('axios');

    const options = {
      method: 'GET',
      url: 'https://apiv4.ordering.co/v400/en/peperoni/orders?mode=dashboard',
      headers: { accept: 'application/json' },
      'x-api-key':
        'U_Uz_WYUD1jbtmAeAKg4q9Jik2PhzPpwTVBJWNctS6aZiCW-LIJG10nPZQKqBkMuj',
    };

    const orders = await axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error: any) {
        console.error(error.response.data);
      });
    return orders;
  }
  async newOrder(@Body() data) {
    console.log(`this is new order`);
    return data; 
  }

  async getOrderbyId(orderId: OrderId) {
    console.log(`this is get orderId:${orderId}`);
  }

  async rejectOrder(orderId: OrderId) {
    console.log(
      `this is reject orderId:${orderId}`,
    );
  }
}
