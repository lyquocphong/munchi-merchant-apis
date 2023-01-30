import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderId } from 'src/type';

@Controller('user')
export class UserController {
  constructor(private orderingIo: OrderingIoService, private prisma: PrismaService) {}
  @UseGuards(JwtGuard)
  @Get(':userId')
  async getUser(@Param('userId') userId: OrderId, @Request() req) {
    const { id } = req.user;
    return this.orderingIo.getUser(id);
  }
}
