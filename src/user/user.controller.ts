import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { OrderId } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private orderingIo: OrderingIoService, private utils: UtilsService, private user: UserService) {}
  @Get(':userId')
  async getUser(@Param('userId') userIdParam: OrderId, @Request() req: any) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getUser(userIdParam, accessToken);
  }
  @Delete(':userId')
  async deleteUser(@Param('userId') userIdParam: OrderId, @Request() req: any) {
    console.log(req.user)
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.user.deleteUser(userId)
  }
}
