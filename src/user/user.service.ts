import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { GetEnvUrl } from '../utils/getEnvUrl';
const axios = require('axios');
@Injectable()
export class UserService {
  constructor(private http: HttpService) {}
  async getUser(userId: string) {
    console.log(userId);

    const options = {
      method: 'GET',
      url: GetEnvUrl('user', userId),
      headers: { accept: 'application/json' },
    };

    const userResponse = axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
    return userResponse;
  }
  getCompany() {
    return 'This is get comapny routes';
  }
}
