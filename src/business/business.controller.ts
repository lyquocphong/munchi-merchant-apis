import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { BusinessId, BusinessStatus } from 'src/type';
import { BusinessService } from './business.service.';
@UseGuards(JwtGuard)
@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService, private prisma: PrismaService) {}
  @Get('allbusiness')
  async getAllBusiness(@Request() req) {
    const { id } = req.user;
    const sessionData = await this.prisma.session.findUnique({
      where: {
        userId: id,
      },
    });
    return this.businessService.getAllBusiness(sessionData.accessToken);
  }
  @Get(':businessId')
  getBusinessById(@Param('businessId') businessId: BusinessId, @Request() req) {
    const acessToken = req.headers.authorization;
    return this.businessService.getBusinessById(businessId, acessToken);
  }
  @Post('getBusinessOnline')
  getBusinessOnline(@Param() businessId: BusinessId, businessStatus: BusinessStatus) {
    return this.businessService.getBusinessOnline(businessId, businessStatus);
  }
  @Post('getBusinessOnline')
  getBusinessOffline(@Param() businessId: BusinessId, businessStatus: BusinessStatus) {
    return this.businessService.getBusinessOffline(businessId, businessStatus);
  }
}
