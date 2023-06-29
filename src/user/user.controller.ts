import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @ApiCreatedResponse({
    description: 'Get a spcecific user',
    type: UserDto,
  })
  @Get(':userId')
  async getUser(@Request() req: any) {
    const { userId } = req.user;
    return this.userService.getUser(userId);
  }
}
