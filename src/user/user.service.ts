import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrderId } from 'src/ts';

import { GetEnvUrl } from '../utils/getEnvUrl';
const axios = require('axios');
@Injectable()
export class UserService {
  async getUser(userId: OrderId) {
    // console.log(userId);
    // const options = {
    //   method: 'GET',
    //   url: GetEnvUrl('user', userId),
    //   headers: { accept: 'application/json' },
    // };

    // const userResponse = axios
    //   .request(options)
    //   .then(function (response) {
    //     console.log(response.data);
    //   })
    //   .catch(function (error) {
    //     console.error(error);
    //   });
    // return userResponse;
    return 'This is get User routes';
  }
  
}
