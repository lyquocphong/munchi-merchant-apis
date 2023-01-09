import {
  Controller,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { BusinessId, BusinessStatus } from 'src/ts';
import { BusinessService } from './business.service.';

@Controller('business')
export class BusinessController {
  constructor(
    private businessService: BusinessService,
  ) {}
  @Get('company')
  getCompany(@Request() req) {
    const token = req.headers.authorization;
    return this.businessService.getBusiness(
      token,
    );
  }
  @Get('allcompany')
  getAllCompany(@Request() req) {
    const token = req.headers.authorization;
    return this.businessService.getAllBusiness(
      token,
    );
  }
  @Post('getBusinessOnline')
  getBusinessOnline(
    @Param() businessId: BusinessId,
    business_status: BusinessStatus,
  ) {
    return this.businessService.getBusinessOnline(
      businessId,
      business_status,
    );
  }
  @Post('getBusinessOnline')
  getBusinessOffline(
    @Param() businessId: BusinessId,
    business_status: BusinessStatus,
  ) {
    return this.businessService.getBusinessOffline(
      businessId,
      business_status,
    );
  }
}
