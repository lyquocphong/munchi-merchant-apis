import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  async getAllOrders() {
    const axios = require('axios');

    const options = {
      method: 'GET',
      url: 'https://apiv4.ordering.co/v400/en/peperoni/orders',
      headers: { accept: 'application/json' },
      'x-api-key': `XCc6ccCL3ziT4kLV6CmAY0k1kODjLK6aVjXayv0bovIZoV7Rh6D0_SFxaA_vTEOel`,
    };

    const orders = await axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error.response.data);
      });
    return orders;
  }
}
