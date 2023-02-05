import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { OrderId } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';

@Controller('user')
export class UserController {
  constructor(private orderingIo: OrderingIoService, private utils: UtilsService) {}
  @UseGuards(JwtGuard)
  @Get(':userId')
  async getUser(@Param('userId') userIdParam: OrderId, @Request() req: any) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getUser(userIdParam, accessToken);
  }
}
