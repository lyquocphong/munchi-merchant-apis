import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderId } from 'src/type';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private prisma: PrismaService) {}
  @UseGuards(JwtGuard)
  @Get(':userId')
  async getUser(@Param('userId') userId: OrderId, @Request() req) {
    const { id } = req.user;
    const sessionData = await this.prisma.session.findUnique({
      where: {
        userId: id,
      },
    });
    return this.userService.getUser(id, sessionData.accessToken);
  }
}
