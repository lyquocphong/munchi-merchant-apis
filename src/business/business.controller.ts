import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { BusinessAttributes } from 'src/type';

import { UtilsService } from 'src/utils/utils.service';

@UseGuards(JwtGuard)
@Controller('business')
export class BusinessController {
  constructor(private utils: UtilsService, private orderingIo: OrderingIoService) {}
  @Post('allbusiness')
  async getAllBusiness(@Request() req: any, @Body('publicUserId') publicUserId: string) {
    const { userId } = req.user;
    if (!publicUserId) {
      return 'No publicUserId';
    }
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getAllBusiness(accessToken, publicUserId);
  }
  @Get(':businessId')
  async getBusinessById(@Param('businessId') businessId: number, @Request() req) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getBusinessById(businessId, accessToken);
  }
  @Post('editBusiness')
  async editBusiness(
    @Request() req: any,
    @Body('publicBusinessId') publicBusinessId: string,
    @Body('status') status: boolean,

  ) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    console.log(status)
    return this.orderingIo.editBusiness( accessToken,publicBusinessId, status);
  }
  @Post('editBusiness/activate')
  async activateBusiness(
    @Request() req: any,
    @Body('publicBusinessId') publicBusinessId: string,
  ) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);

    return this.orderingIo.activateBusiness( accessToken,publicBusinessId);
  }
  @Post('editBusiness/deactivate')
  async deactivateBusiness(
    @Request() req: any,
    @Body('publicBusinessId') publicBusinessId: string,
  ) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);

    return this.orderingIo.deactivateBusiness( accessToken,publicBusinessId);
  }
}
