import { Body, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { OrderData } from 'src/type';
import { OrderDto } from './dto/order.dto';
import { UtilsService } from 'src/utils/utils.service';
import axios from 'axios';

@Injectable()
export class OrderService {
  constructor(private utils: UtilsService) {}
  async getAllOrders(acessToken: string) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('orders')}?status=0&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${acessToken}`,
      },
    };

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

  async getOrderbyId(orderId: number, acessToken: string) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('orders', orderId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${acessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
      const order = plainToClass(OrderDto, response.data.result);

      console.log(order);

      return order;
    } catch (error) {
      console.error(error.response.data);
      const errorMsg = error.response.data;
      return Error(errorMsg);
    }
  }

  async rejectOrder(orderId: number) {
    console.log(`this is reject orderId:${orderId}`);
  }

  async updateOrder(orderId: number, data: OrderData) {
    console.log(
      `this is updated order with prep_time:${orderId} , ${data.prepaired_in}, ${data.orderStatus}`,
    );
  }
}
