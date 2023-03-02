import { Injectable, ForbiddenException } from '@nestjs/common';
import { Business } from '@prisma/client';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import console from 'console';
import { BusinessService } from 'src/business/business.service';
import { AllBusinessDto, BusinessDto } from 'src/business/dto/business.dto';
import { OrderDto } from 'src/order/dto/order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthCredentials, BusinessAttributes, FilterQuery, OrderData } from 'src/type';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class OrderingIoService {
  constructor(
    private utils: UtilsService,
    private business: BusinessService,
    private user: UserService,
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
        security_recaptcha_auth: '0',
      },
    };
    try {
      const response = await axios.request(options);
      const signInResponseObject = response.data.result;
      const { access_token } = signInResponseObject.session;
      const existingUser = await this.user.checkExistUser(signInResponseObject.id);
      console.log(existingUser);
      if (existingUser === null || !existingUser) {
        const newUserResponse = await this.user.createUser(
          signInResponseObject,
          credentials.password,
        );
        return newUserResponse;
      } else if (existingUser) {
        await this.utils.getSession(signInResponseObject.id, access_token);
        return existingUser;
      }
    } catch (error) {
      this.utils.getError(error);
    }
  }

  async signUp(credentials: AuthCredentials) {
    const options = {
      method: 'POST',
      url: this.utils.getEnvUrl('users'),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        firstName: credentials.firstName,
        lastname: credentials.lastname,
        level: credentials.role,
        email: credentials.email,
        password: credentials.password,
      },
    };
    try {
      const response = await axios.request(options);
      const signUpResponseObject = response.data.result;
      const { access_token } = signUpResponseObject.session;
      const existingUser = await this.user.getUser(signUpResponseObject.id, null);
      if (existingUser === null || !existingUser) {
        const newUserResponse = await this.user.createUser(
          signUpResponseObject,
          credentials.password,
        );
        return newUserResponse;
      } else if (existingUser) {
        await this.utils.getSession(signUpResponseObject.id, access_token);
        return existingUser;
      }
    } catch (error) {
      this.utils.getError(error);
    }
  }
  async signOut(publicUserId: string) {
    return this.utils.getUpdatedPublicId(publicUserId);
  }

  //business services
  async getAllBusiness(accessToken: string, publicUserId: string) {
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
      const user = await this.user.getUserInternally(null, publicUserId);
      if (user === null) throw new ForbiddenException('Something wrong happend');
      businessResponseObject.map(async (business: Business) => {
        const existedBusiness = await this.business.getBusinessById(business.id);
        if (existedBusiness) {
          return user.business;
        } else {
          const newBusiness = await this.business.addBusiness(business.id, user.userId);
          return newBusiness;
        }
      });
      return this.business.getAllBusiness(user.userId);
    } catch (error) {
      this.utils.getError(error);
    }
  }

  async getBusinessById(publicBusinessId: string, accessToken: string) {
    const business = await this.business.getBusinessByPublicId(publicBusinessId);
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('business', business.businessId)}?mode=dashboard`,
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
      this.utils.getError(error);
    }
  }

  async editBusiness(accessToken: string, publicBusinessId: string, status: any) {
    console.log(publicBusinessId, 'this is service IO');
    const business = await this.business.getBusinessByPublicId(publicBusinessId);
    console.log(status);
    // // const data = JSON.parse(status)
    // console.log(data)
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
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      // console.log(response);
      return `Business Online`;
    } catch (error) {
      this.utils.getError(error);
    }
  }
  async activateBusiness(accessToken: string, publicBusinessId: string) {
    const business = await this.business.getBusinessByPublicId(publicBusinessId);
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
      // console.log(response);
      return businessResponse;
    } catch (error) {
      this.utils.getError(error);
    }
  }
  async deactivateBusiness(accessToken: string, publicBusinessId: string) {
    const business = await this.business.getBusinessByPublicId(publicBusinessId);
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
      // console.log(response);
      return businessResponse;
    } catch (error) {
      this.utils.getError(error);
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
      this.utils.getError(error);
    }
  }

  async getFilteredOrders(
    accessToken: string,
    query: string,
    paramsQuery: string[],
    publicBusinessId: string,
  ) {
    const business = await this.business.getBusinessByPublicId(publicBusinessId);
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('orders')}?mode=dashboard&where={"business_id":${
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
      this.utils.getError(error);
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
      this.utils.getError(error);
    }
  }

  async updateOrder(orderId: number, orderData: OrderData, acessToken: string) {
    const options = {
      method: 'PUT',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: { accept: 'application/json', Authorization: `Bearer ${acessToken}` },
      data: { status: orderData.orderStatus, prepared_in: orderData.preparedIn },
    };
    try {
      const response = await axios.request(options);
      const order = plainToClass(OrderDto, response.data.result);
      return order;
    } catch (error) {
      this.utils.getError(error);
    }
  }
  async removeOrder(orderId: number, acessToken: string) {
    const options = {
      method: 'DELETE',
      url: `${this.utils.getEnvUrl('orders', orderId)}`,
      headers: { accept: 'application/json', Authorization: `Bearer ${acessToken}` },
    };
    try {
      const response = await axios.request(options);
    } catch (error) {
      this.utils.getError(error);
    }
  }

  //User service
  async getUser(userId: number, accessToken: string) {
    const options = {
      method: 'GET',
      url: this.utils.getEnvUrl('users', userId),
      headers: { accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    };
    try {
      const response = await axios.request(options);
      const userResponseObject = response.data.result;
      const userResponse = plainToClass(UserDto, userResponseObject);
      return userResponse;
    } catch (error) {
      this.utils.getError(error);
    }
  }
}
