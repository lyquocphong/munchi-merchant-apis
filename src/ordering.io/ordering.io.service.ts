import axios from 'axios';
import Cryptr from 'cryptr';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthCredentials, FilterQuery, OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { AllBusinessDto, BusinessDto } from 'src/business/dto/business.dto';
import { OrderDto } from 'src/order/dto/order.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class OrderingIoService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UtilsService))
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
        security_recaptcha_auth: '0',
      },
    };

    try {
      const response = await axios.request(options);
      const signInResponseObject = response.data.result;
      const { access_token } = signInResponseObject.session;
      const updateSession = await this.utils.getSession(signInResponseObject.id, access_token);
      const existingUser = await this.utils.getUser(signInResponseObject.id, null);
      if (!existingUser) {
        const user = this.utils.createUser(signInResponseObject!);
        console.log(user);
      }

      const signInResponse = plainToClass(AuthDto, signInResponseObject);
      const verifyToken = await this.utils.signToken(signInResponse.id, signInResponse.email);
      const finalResponse = Object.assign(signInResponse, verifyToken);
      return finalResponse;
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
        name: credentials.name,
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
      const updatedSession = this.utils.getSession(signUpResponseObject.id, access_token);
      const existingUser = await this.utils.getUser(signUpResponseObject.id, null);
      if (!existingUser) {
        this.utils.createUser(signUpResponseObject);
      }
      const signUnResponse = plainToClass(AuthDto, signUpResponseObject);
      const verifyToken = await this.utils.signToken(signUnResponse.id, signUnResponse.email);
      const finalResponse = Object.assign(signUnResponse, verifyToken);
      return finalResponse;
    } catch (error) {
      this.utils.getError(error);
    }
  }
  async signOut(publicUserId: string) {
    return  this.utils.getUpdatedPublicId(publicUserId)
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
      const user = await this.utils.getUser(null, publicUserId);
      const existingBusiness = await this.prisma.business.findMany();
      if (!existingBusiness) {
        const newBusiness = businessResponseObject.map(async (business: any) => {
          const publicBusinessId = this.utils.getPublicId();
          await this.prisma.business.create({
            data: {
              id: business.id,
              name: business.name,
              publicId: publicBusinessId,
              userId: user.id,
            },
          });
        });
        const businessResponse = plainToClass(AllBusinessDto, newBusiness);
        return businessResponse;
      } else {
        const businessResponse = plainToClass(AllBusinessDto, existingBusiness);
        return businessResponse;
      }
    } catch (error) {
      this.utils.getError(error);
    }
  }

  async getBusinessById(businessId: number, accessToken: string) {
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
      const businessResponseObject = response.data.result;
      const businessResponse = plainToClass(BusinessDto, businessResponseObject);
      return businessResponse;
    } catch (error) {
      this.utils.getError(error);
    }
  }

  async getBusinessOnline(businessId: number, accessToken: string) {
    const options = {
      method: 'POST',
      url: `${this.utils.getEnvUrl('business', businessId)}`,
      data: { enabled: true },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      return `Business Online`;
    } catch (error) {
      this.utils.getError(error);
    }
  }
  async getBusinessOffline(businessId: number, accessToken: string) {
    const options = {
      method: 'POST',
      url: `${this.utils.getEnvUrl('business', businessId)}`,
      data: { enabled: false },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      console.log(businessResponseObject);
      return `Business Offline`;
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
      data: { status: orderData.orderStatus, prepared_in: orderData.prepared_in },
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
