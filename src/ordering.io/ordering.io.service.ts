/* eslint-disable prettier/prettier */

import { ForbiddenException, Inject, Injectable, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { BusinessService } from 'src/business/business.service';
import { BusinessDto } from 'src/business/dto/business.dto';
import { OrderDto } from 'src/order/dto/order.dto';
import { AuthCredentials, OrderData } from 'src/type';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class OrderingIoService {
  constructor(
    @Inject(forwardRef(() => BusinessService)) private business: BusinessService,
    @Inject(forwardRef(() => UserService)) private user: UserService,
    private utils: UtilsService,
  ) {}
  // Auth service
  async signIn(credentials: AuthCredentials) {
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
      return response.data.result;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async signOut(publicUserId: string) {
    return this.utils.getUpdatedPublicId(publicUserId);
  }

  //business services
  async getAllBusiness(userId: number, publicUserId: string) {
    const accessToken = await this.utils.getAccessToken(userId);
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('business')}?type=1&params=zones%2Cname&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      const user = await this.user.getUserByPublicId(publicUserId);

      if (!user) {
        throw new ForbiddenException('Something wrong happend');
      }

      for (const business of businessResponseObject) {
        const existedBusiness = await this.business.findBusinessById(business.id);

        if (existedBusiness) {
          // Check ownership of the new user with existed business
          const owner = existedBusiness.owners.filter((owner) => owner.userId === user.userId);
          // If no ownership then add and update it to business
          if (owner.length < 1) {
            await this.business.updateBusinessOwners(business, user.userId);
          } else {
            return await this.business.findAllBusiness(user.userId);
          }
        } else {
          await this.business.createBusiness(business, user.userId);
        }
      }
      return await this.business.findAllBusiness(user.userId);
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

  async editBusiness(accessToken: string, publicBusinessId: string, status: any) {
    const business = await this.business.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException('Something wrong happened');
    }
    const options = {
      method: 'POST',
      url: `${this.utils.getEnvUrl('business', business.businessId)}`,
      data: { enabled: status },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      return await axios.request(options);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async activateBusiness(accessToken: string, publicBusinessId: string) {
    const business = await this.business.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException('Something wrong happened');
    }
    const options = {
      method: 'POST',
      url: `${this.utils.getEnvUrl('business', business.businessId)}`,
      data: { enabled: true },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      const businessResponse = plainToClass(BusinessDto, businessResponseObject);

      return businessResponse;
    } catch (error) {
      this.utils.logError(error);
    }
  }
  async deactivateBusiness(accessToken: string, publicBusinessId: string) {
    const business = await this.business.findBusinessByPublicId(publicBusinessId);
    if (!business) {
      throw new ForbiddenException('Something wrong happened');
    }
    const options = {
      method: 'POST',
      url: `${this.utils.getEnvUrl('business', business.businessId)}`,
      data: { enabled: false },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      const businessResponse = plainToClass(BusinessDto, businessResponseObject);

      return businessResponse;
    } catch (error) {
      this.utils.logError(error);
    }
  }
  //Order service
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
      return order;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getFilteredOrders(
    userId: number,
    query: string,
    paramsQuery: string[],
    publicBusinessId: string,
  ) {
    const accessToken = await this.utils.getAccessToken(userId);
    const business = await this.business.findBusinessByPublicId(publicBusinessId);

    if (!business) {
      throw new ForbiddenException('Something wrong happened');
    }
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('orders')}?mode=dashboard&where={${query},"business_id":${
        business.businessId
      }}&params=${paramsQuery}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.request(options);
      const order = plainToClass(OrderDto, response.data.result);
      return order;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async getOrderbyId(orderId: number, accessToken: string) {
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
      const order = plainToClass(OrderDto, response.data.result);
      return order;
    } catch (error) {
      this.utils.logError(error);
    }
  }

  async updateOrder(orderId: number, orderData: OrderData, acessToken: string) {
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
      const order = plainToClass(OrderDto, response.data.result);

      return order;
    } catch (error) {
      this.utils.logError(error);
    }
  }
  async removeOrder(orderId: number, acessToken: string) {
    const options = {
      method: 'DELETE',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${acessToken}`,
      },
    };

    try {
      await axios.request(options);
    } catch (error) {
      this.utils.logError(error);
    }
  }

  //User service
  async getUser(userId: number, accessToken: string) {
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
      const userResponseObject = response.data.result;
      const userResponse = plainToClass(UserDto, userResponseObject);

      return userResponse;
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
      const pageResponseObject = response.data.result;
      return pageResponseObject;
    } catch (error) {
      this.utils.logError(error);
    }
  }
}
