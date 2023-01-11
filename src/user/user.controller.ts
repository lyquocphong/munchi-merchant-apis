import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from 'src/auth/guard';
import { OrderId } from 'src/type';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get(':userId')
  getUser(@Param('userId') userId: OrderId,
  @Request() req) {
    const acessToken = req.headers.authorization
    return this.userService.getUser(userId, acessToken);
  }
}
