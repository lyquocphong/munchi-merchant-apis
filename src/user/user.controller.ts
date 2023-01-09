import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderId } from 'src/ts';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(AuthGuard('jwt'))

  @Get(':userId')
  getUser(@Param('userId') userId: OrderId) {
    return this.userService.getUser(userId);
  }
}
