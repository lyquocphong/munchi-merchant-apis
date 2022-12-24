import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthCredentials } from 'src/ts';

const axios = require('axios');
@Injectable()
export class AuthService {
  async signup(credentials: AuthCredentials) {
    // console.log(
    //   credentials.email,
    //   credentials.password,
    // );
    const options = {
      method: 'POST',
      url: `${process.env.BASE_URL}users`,
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

    const signUpResponse = await axios
      .request(options)
      .then(function (response: any) {
        // console.log(response);
        const data = response.data.result;
        return data;
      })
      .catch(function (error: any) {
        const errorMsg =
          error.response.data.result;
        throw Error(errorMsg);
      });

    return signUpResponse;
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
    const signInResponse = await axios
      .request(options)
      .then(function (response: any) {
        console.log(response.data.result);
        const data = response.data.result;
        return 'Sign in successfully';
      })
      .catch((error: any) => {
        console.log(error);
        const errorMsg =
          error.response.data.result;
        return errorMsg;
      });
    return signInResponse;
  }
}
