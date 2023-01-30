import axios from 'axios';
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

@Injectable()
export class OrderingIoService {
  constructor(
    private readonly jwt: JwtService,
    private config: ConfigService,
    private readonly prisma: PrismaService,
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
    //
    try {
      const response = await axios.request(options);
      const signInResponseOnject = response.data.result;
      const { access_token, token_type, expires_in } = signInResponseOnject.session;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: signInResponseOnject.id,
        },
      });

      if (existingUser) {
        await this.prisma.user.update({
          where: {
            id: signInResponseOnject.id,
          },
          data: {
            session: {
              update: {
                accessToken: access_token,
              },
            },
          },
        });
        const signInResponse = plainToClass(AuthDto, signInResponseOnject);
        //check user name co session hay chua

        const verifyToken = await this.signToken(signInResponse.id, signInResponse.email);
        const finalResponse = Object.assign(signInResponse, verifyToken);
        return finalResponse;
      } else {
        await this.prisma.user.create({
          data: {
            id: signInResponseOnject.id,
            name: signInResponseOnject.name,
            lastname: signInResponseOnject.lastname,
            email: signInResponseOnject.email,
            level: signInResponseOnject.level,
            session: {
              create: {
                accessToken: access_token,
                expiresIn: expires_in,
                tokenType: token_type,
              },
            },
          },
        });
      }
      this.utils.getTokenAfterExpired(expires_in, credentials.email, credentials.password);
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw new ForbiddenException(errorMsg);
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
      const { access_token, token_type, expires_in } = signUpResponseObject.session;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: signUpResponseObject.id,
        },
      });
      if (existingUser) {
        await this.prisma.user.update({
          where: {
            id: signUpResponseObject.id,
          },
          data: {
            session: {
              update: {
                accessToken: access_token,
              },
            },
          },
        });
        const signInResponse = plainToClass(AuthDto, signUpResponseObject);
        //check user name co session hay chua

        const verifyToken = await this.signToken(signInResponse.id, signInResponse.email);
        const finalResponse = Object.assign(signInResponse, verifyToken);
        return finalResponse;
      } else {
        await this.prisma.user.create({
          data: {
            id: signUpResponseObject.id,
            name: signUpResponseObject.name,
            lastname: signUpResponseObject.lastname,
            email: signUpResponseObject.email,
            level: signUpResponseObject.level,
            session: {
              create: {
                accessToken: access_token,
                expiresIn: expires_in,
                tokenType: token_type,
              },
            },
          },
        });
      }
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw new ForbiddenException(errorMsg);
    }
  }
  async signToken(userId: number, email: string): Promise<{ verifyToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '4h',
      secret: secret,
    });

    return {
      verifyToken: token,
    };
  }

  //business services

  async getAllBusiness(accessToken: string) {
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
      const businessResponse = plainToClass(AllBusinessDto, businessResponseObject);
      return businessResponse;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw new ForbiddenException(errorMsg);
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
      //lam 1 cai bang business => generate public id
      console.log(businessResponse);
      return businessResponse;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw new ForbiddenException(errorMsg);
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

      console.log(businessResponseObject);
      return `Business Online`;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw Error(errorMsg);
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
      const errorMsg = error.response.data.result;
      throw Error(errorMsg);
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

  //User service
  async getUser(userId: number) {
    const acessToken = await this.utils.getAccessToken(userId);
    const options = {
      method: 'GET',
      url: this.utils.getEnvUrl('users', userId),
      headers: { accept: 'application/json', Authorization: `Bearer ${acessToken}` },
    };
    try {
      const response = await axios.request(options);
      const userResponseObject = response.data.result;
      const userResponse = plainToClass(UserDto, userResponseObject);
      return userResponse;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw new ForbiddenException(errorMsg);
    }
  }

}
