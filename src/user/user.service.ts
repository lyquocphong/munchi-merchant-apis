import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrderId } from 'src/type';
import { getEnvUrl } from '../utils/getEnvUrl';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  async getUser(userId: OrderId, acessToken: string) {
   
    const options = {
      method: 'GET',
      url: getEnvUrl('users', userId),
      headers: { accept: 'application/json', Authorization: `Bearer ${acessToken}` },
    };
    try {
      const response = await axios.request(options);
      const userResponseObject = response.data.result;
      const userResponse = plainToClass(UserDto, userResponseObject);
      return userResponse;
    } catch (error) {
      console.log(error);
    }
  }
}
