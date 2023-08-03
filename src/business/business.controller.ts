/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { BusinessService } from './business.service';
import { AllBusinessDto, BusinessDto, SetOnlineStatusDto } from './dto/business.dto';

@UseGuards(JwtGuard)
@Controller('business')
@ApiBearerAuth('JWT-auth')
@ApiBadRequestResponse({
  description: 'Something wrong happened',
})
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @ApiCreatedResponse({
    description: 'Get all businesses',
    type: AllBusinessDto,
  })
  @Get('allbusiness')
  async getAllBusiness(@Request() req: any) {
    const { userId } = req.user;
    return this.businessService.getAllBusiness(userId);
  }
  @ApiCreatedResponse({
    description: 'Get a specific business',
    type: BusinessDto,
  })
  @Get(':businessId')
  async getBusinessById(@Request() req: any, @Param('businessId') publicBusinessId: string) {
    const { userId } = req.user;
    return this.businessService.getBusinessById(userId, publicBusinessId);
  }
  @ApiCreatedResponse({
    description: 'Edit a specific business',
    type: BusinessDto,
  })


  @Post('online-status')
  async setOnlineStatus(
    @Request() req: any,
    @Body() body: SetOnlineStatusDto
  ) {
    const { userId } = req.user;
    const { publicBusinessId, status} = body;
    return this.businessService.setTodayScheduleStatus(userId, publicBusinessId, status);
  }
}
