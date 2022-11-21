import {
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthCredentials } from 'src/ts';



const axios = require('axios');
@Injectable()
export class AuthService {
  async signup(credentials: AuthCredentials) {
    console.log(credentials.email, credentials.password)
    const options = {
      method: 'POST',
      url: `${process.env.BASE_URL}users`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        country_phone_code: 1,
        level: 3,
        busy: false,
        available: true,
        enabled: true,
        security_recaptcha_signup: '1 or 0',
        email: credentials.email,
        password: credentials.password,
      },
    };
    try {
      axios
        .request(options)
        .then(function (response: Response) {
          console.log(response);
        })
        .catch(function (error: any) {
          console.log(
            error.response.data.result,
          );
        });
    } catch (error) {
      console.log("throw error")
      throw error;
    }
  }

  async signin(credentials: AuthCredentials) {
    const options = {
      method: 'POST',
      url: `${process.env.BASE_URL}auth`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        email: credentials.email,
        password: credentials.password,
        security_recaptcha_auth: '1 or 0',
      },
    };

    axios
      .request(options)
      .then(function (response: Response) {
        console.log(response);
      })
      .catch(function (error:any) {
        console.error(error);
      });
    
  }
}
