import { Body, Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { OrderData, OrderId } from 'src/ts';
import { GetEnvUrl } from 'src/utils/getEnvUrl';
import { OrderDto } from './dto/order.dto';

import axios from 'axios';

@Injectable()
export class OrderService {
  async getAllOrders(token: string) {
    const options = {
      method: 'GET',
      url: `${GetEnvUrl(
        'orders',
      )}?status=0&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `${token}`,
      },
    };
    console.log(
      `${GetEnvUrl(
        'orders',
      )}?limit=3&mode=dashboard`,
    );
    const ordersResponse = await axios
      .request(options)
      .then(function (response: any) {
        console.log(response.data);
        const data = response.data;
        return data;
      })
      .catch(function (error: any) {
        console.error(error.response.data);
      });
    return ordersResponse;
  }

  async newOrder(@Body() data) {
    console.log(`this is new order`);
    return data;
  }

  async getOrderbyId(
    orderId: OrderId,
    token: string,
  ) {
    const options = {
      method: 'GET',
      url: `${GetEnvUrl(
        'orders',
        orderId,
      )}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `${token}`,
      },
    };

    try {
      const response = await axios.request(
        options,
      );
      console.log(response.data);
      const order = plainToClass(
        OrderDto,
        response.data.result,
      );

      console.log(order);

      return order;
    } catch (error) {
      console.error(error.response.data);
      const errorMsg = error.response.data;
      return Error(errorMsg);
    }
  }

  async rejectOrder(orderId: OrderId) {
    console.log(
      `this is reject orderId:${orderId}`,
    );
  }

  async updateOrder(
    orderId: OrderId,
    data: OrderData,
  ) {
    console.log(
      `this is updated order with prep_time:${orderId} , ${data.prepaired_in}, ${data.order_status}`,
    );
  }
}
