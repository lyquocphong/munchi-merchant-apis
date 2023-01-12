import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { BusinessId, BusinessStatus } from 'src/type';
import { BusinessService } from './business.service.';

@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Get('')
  getBusiness(@Request() req) {
    const acessToken = req.headers.authorization;
    return this.businessService.getBusiness(acessToken);
  }
  @Get('allbusiness')
  getAllBusiness(@Request() req) {
    const acessToken = req.headers.authorization;
    return this.businessService.getAllBusiness(acessToken);
  }
  @Get(':businessId')
  getBusinessById(@Param('businessId') businessId: BusinessId, @Request() req) {
    const acessToken = req.headers.authorization;
    return this.businessService.getBusinessById(businessId, acessToken);
  }
  @Post('getBusinessOnline')
  getBusinessOnline(@Param() businessId: BusinessId, business_status: BusinessStatus) {
    return this.businessService.getBusinessOnline(businessId, business_status);
  }
  @Post('getBusinessOnline')
  getBusinessOffline(@Param() businessId: BusinessId, business_status: BusinessStatus) {
    return this.businessService.getBusinessOffline(businessId, business_status);
  }
}
