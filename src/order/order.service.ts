import { Body, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { FilterQuery, OrderData } from 'src/type';
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
    try {
      const response = await axios.request(options);
      const order = plainToClass(OrderDto, response.data.result);
      console.log(order);
      return order;
    } catch (error) {
      console.error(error.response.data);
      const errorMsg = error.response.data;
      return Error(errorMsg);
    }
  }

  async getFilteredOrders(accessToken: string, filterQuery: FilterQuery, paramsQuery: string) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('orders')}?mode=dashboard&where={"status":${
        filterQuery.status
      },"business_id":${filterQuery.businessId}}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);
      const order = plainToClass(OrderDto, response.data.result);
      console.log(order);
      return order;
    } catch (error) {
      console.log(error.response.data);
      const errorMsg = error.response.data;
      return Error(errorMsg);
    }
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

  async updateOrder(orderId: number, orderData: OrderData, acessToken: string) {
    const options = {
      method: 'PUT',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: { accept: 'application/json', Authorization: `Bearer ${acessToken}` },
      data: { status: orderData.orderStatus, prepared_in: orderData.prepared_in },
    };
    try {
      const response = await axios.request(options);
      console.log(response.data);
      console.log(response.data);
      const order = plainToClass(OrderDto, response.data.result);
      console.log(order);
      return order;
    } catch (error) {
      console.log(error.response.data);
      const errorMsg = error.response.data;
      return Error(errorMsg);
    }
  }
  async removeOrder(orderId: number, acessToken: string) {
    console.log(`this is remove orderId:${orderId}`);
    const options = {
      method: 'DELETE',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: { accept: 'application/json', Authorization: `Bearer ${acessToken}` },
    };
    try {
      const response = await axios.request(options);
      console.log(response);
    } catch (error) {
      const errorMsg = error.response.data;
      return Error(errorMsg);
    }
  }
}
