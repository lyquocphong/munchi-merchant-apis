import { Controller, Get, Param, Post, Request, UseGuards, Body, Put } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

import { BusinessService } from './business.service.';
@UseGuards(JwtGuard)
@Controller('business')
export class BusinessController {
  constructor(
    private businessService: BusinessService,
    private utils: UtilsService,
  ) {}
  @Get('allbusiness')
  async getAllBusiness(@Request() req) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.businessService.getAllBusiness(accessToken);
  }
  @Get(':businessId')
  async getBusinessById(@Param('businessId') businessId: number, @Request() req) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.businessService.getBusinessById(businessId, accessToken);
  }
  @Post(':businessId/getBusinessOnline')
  async getBusinessOnline(
    @Request() req: any,
    @Param('businessId') businessId: number
  ) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
   console.log(businessId)
    return this.businessService.getBusinessOnline(businessId, accessToken);
  }
  @Post(':businessId/getBusinessOffline')
  async getBusinessOffline(
    @Request() req: any,
    @Param('businessId') businessId: number
  ) {
    const { id } = req.user;
    const accessToken = await this.utils.getAccessToken(id);
    return this.businessService.getBusinessOffline(businessId, accessToken);
  }
}
