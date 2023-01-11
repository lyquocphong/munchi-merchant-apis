import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrderId } from 'src/type';
import { getEnvUrl } from '../utils/getEnvUrl';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  async getUser(userId: OrderId, acessToken: string) {
    console.log(userId);
    const options = {
      method: 'getEnvUrl',
      url: getEnvUrl('users', userId),
      headers: { accept: 'application/json', Authorization: `${acessToken}` },
    };
    console.log(getEnvUrl('user', userId));
    try {
      const response = await axios.request(options);
      const userResponseObject = response.data.result
      const userResponse = plainToClass(UserDto, userResponseObject)
      console.log(userResponse)
      return userResponse
    } catch (error) {
      console.log(error)
    }
  }
}
