import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { JwtGuard } from 'src/auth/guard';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { BusinessAttributes } from 'src/type';

import { UtilsService } from 'src/utils/utils.service';
import { AllBusinessDto, BusinessDto } from './dto/business.dto';

@UseGuards(JwtGuard)
@Controller('business')
@ApiBearerAuth('JWT-auth')
@ApiBadRequestResponse({
  description: 'Something wrong happened',
})
export class BusinessController {
  constructor(private utils: UtilsService, private orderingIo: OrderingIoService) {}
  
  @ApiCreatedResponse({
    description: 'Get all businesses',
    type: AllBusinessDto,
  })
  @Post('allbusiness')
  async getAllBusiness(@Request() req: any, @Body('publicUserId') publicUserId: string) {
    const { userId } = req.user;
    if (!publicUserId) {
      return 'No publicUserId';
    }
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getAllBusiness(accessToken, publicUserId);
  }
  @ApiCreatedResponse({
    description: 'Get a specific business',
    type: BusinessDto,
  })
  @Post('findBusiness')
  async getBusinessById(@Request() req: any, @Body('publicBusinessId') publicBusinessId: string) {
    const { userId } = req.user;
    const accessToken = await this.utils.getAccessToken(userId);
    return this.orderingIo.getBusinessById(publicBusinessId, accessToken);
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
    console.log(status);
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
