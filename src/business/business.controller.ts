/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { UtilsService } from 'src/utils/utils.service';
import { AllBusinessDto, BusinessDto } from './dto/business.dto';
import { BusinessService } from './business.service';

@UseGuards(JwtGuard)
@Controller('business')
@ApiBearerAuth('JWT-auth')
@ApiBadRequestResponse({
  description: 'Something wrong happened',
})
export class BusinessController {
  constructor(
    private utils: UtilsService,
    private orderingIo: OrderingIoService,
    private business: BusinessService,
  ) {}

  @ApiCreatedResponse({
    description: 'Get all businesses',
    type: AllBusinessDto,
  })
  @Post('allbusiness')
  async getAllBusiness(@Request() req: any, @Body('publicUserId') publicUserId: string) {
    const { userId } = req.user;
    return this.orderingIo.getAllBusiness(userId, publicUserId);
  }
  @ApiCreatedResponse({
    description: 'Get a specific business',
    type: BusinessDto,
  })
  @Get(':businessId')
  async getBusinessById(@Request() req: any, @Param('businessId') publicBusinessId: string) {
    const { userId } = req.user;
    return this.business.getBusinessById(userId, publicBusinessId);
  }
  @ApiCreatedResponse({
    description: 'Edit a specific business',
    type: BusinessDto,
  })
  @Post('editBusiness')
  async editBusiness(
    @Request() req: any,
    @Body('publicBusinessId') publicBusinessId: string,
    @Body('status') status: boolean,
  ) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);

    return this.orderingIo.editBusiness(accessToken, publicBusinessId, status);
  }
  @ApiCreatedResponse({
    description: 'Activate business',
    type: BusinessDto,
  })
  @Post('editBusiness/activate')
  async activateBusiness(@Request() req: any, @Body('publicBusinessId') publicBusinessId: string) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);

    return this.orderingIo.activateBusiness(accessToken, publicBusinessId);
  }
  @ApiCreatedResponse({
    description: 'Deactivate business',
    type: BusinessDto,
  })
  @Post('editBusiness/deactivate')
  async deactivateBusiness(
    @Request() req: any,
    @Body('publicBusinessId') publicBusinessId: string,
  ) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);

    return this.orderingIo.deactivateBusiness(accessToken, publicBusinessId);
  }
}
