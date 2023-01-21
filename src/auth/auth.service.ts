import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthCredentials } from 'src/type';

import { plainToClass } from 'class-transformer';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private config: ConfigService,
    private readonly prisma: PrismaService,
    private utils: UtilsService,
  ) {}
  async signup(credentials: AuthCredentials) {
    // console.log(
    //   credentials.email,
    //   credentials.password,
    // );
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

  async signin(credentials: AuthCredentials) {
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
      //ordering service
      const response = await axios.request(options);
      const signInResponseOnject = response.data.result;
      // save database here signInResponse
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

  async signToken(userId: number, email: string): Promise<{ verify_token: string }> {
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
      verify_token: token,
    };
  }
}
