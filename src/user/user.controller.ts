import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { OrderId } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private orderingIo: OrderingIoService,
    private utils: UtilsService,
    private user: UserService,
  ) {}
  @ApiCreatedResponse({
    description: 'Get a spcecific user',
    type: UserDto,
  })
  @Get(':userId')
  async getUser(@Param('userId') userIdParam: OrderId, @Request() req: any) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getUser(userIdParam, accessToken);
  }
}
