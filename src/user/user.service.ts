import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { plainToClass } from 'class-transformer';
import { UtilsService } from 'src/utils/utils.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private utils: UtilsService) {}
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
