import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';

import { UtilsService } from 'src/utils/utils.service';

@UseGuards(JwtGuard)
@Controller('business')
export class BusinessController {
  constructor(private utils: UtilsService, private orderingIo: OrderingIoService) {}
  @Get('allbusiness')
  async getAllBusiness(@Request() req: any, @Body('publicUserId') publicUserId: string) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getAllBusiness(accessToken, publicUserId);
  }
  @Get(':businessId')
  async getBusinessById(@Param('businessId') businessId: number, @Request() req) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getBusinessById(businessId, accessToken);
  }
  @Post(':businessId/getBusinessOnline')
  async getBusinessOnline(@Request() req: any, @Param('businessId') businessId: number) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    console.log(businessId);
    return this.orderingIo.getBusinessOnline(businessId, accessToken);
  }
  @Post(':businessId/getBusinessOffline')
  async getBusinessOffline(@Request() req: any, @Param('businessId') businessId: number) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getBusinessOffline(businessId, accessToken);
  }
}
