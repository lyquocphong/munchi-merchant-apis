import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { Business, Order } from 'ordering-api-sdk';
import { AuthCredentials, OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { OrderingUser } from '../../ordering/ordering.type';
@Injectable()
export class OrderingService {
  private readonly logger = new Logger(OrderingService.name);

  constructor(private utils: UtilsService) {}
  // Auth service
  async signIn(credentials: AuthCredentials): Promise<OrderingUser> {
    const options = {
      method: 'POST',
      url: this.utils.getEnvUrl('auth'),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        email: credentials.email,
        password: credentials.password,
      },
    };

    try {
      const response = await axios.request(options);
      return plainToInstance(OrderingUser, response.data.result);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async signOut(accessToken: string) {
    const options = {
      method: 'POST',
      url: this.utils.getEnvUrl('auth', 'logout'),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  //business services
  async getAllBusiness(accessToken: string): Promise<Business[]> {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl(
        'business',
      )}?type=1&params=name,email,phone,address,logo,metafields,description,today,schedule,owners,enabled&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getBusinessById(accessToken: string, businessId: number) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('business', businessId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async editBusiness(accessToken: string, businessId: number, data: object): Promise<Business> {
    const options = {
      method: 'POST',
      url: `${this.utils.getEnvUrl('business', businessId)}`,
      data,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    this.logger.warn('edit business', options.url, data);

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrderForBusinesses(
    accessToken: string,
    businessIds: number[],
    query: string,
    paramsQuery: string[],
  ) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl(
        'orders',
      )}?mode=dashboard&where={${query},"business_id":[${businessIds}]}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getFilteredOrders(
    accessToken: string,
    businessId: number,
    query: string,
    paramsQuery: string[],
  ) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl(
        'orders',
      )}?mode=dashboard&where={${query},"business_id":${businessId}}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrderbyId(accessToken: string, orderId: number) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('orders', orderId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getUserKey(accessToken: string, userId: number) {
    const options = {
      method: 'GET',
      url: `https://apiv4.ordering.co/v400/language/peperoni/users/${userId}/keys
      `,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async updateOrder(acessToken: string, orderId: number, orderData: OrderData): Promise<Order> {
    const options = {
      method: 'PUT',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${acessToken}`,
      },
      data: {
        status: orderData.orderStatus,
        prepared_in: orderData.preparedIn,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async deleteOrder(acessToken: string, orderId: number) {
    const options = {
      method: 'DELETE',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${acessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  //User service
  async getUser(accessToken: string, userId: number) {
    const options = {
      method: 'GET',
      url: this.utils.getEnvUrl('users', userId),
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  //Page
  async getPage(accessToken: string) {
    const options = {
      method: 'GET',
      url: this.utils.getEnvUrl('pages'),
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  /**
   * Set schedule for business
   *
   * @param accessToken
   * @param schedule    Json string of schedule
   * @returns
   */
  async setBusinessSchedule(accessToken: string, schedule: string) {
    const options = {
      method: 'GET',
      url: this.utils.getEnvUrl('pages'),
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }
}
