import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { BusinessService } from './business.service';
import { AllBusinessDto, BusinessDto, SetOnlineStatusDto } from './dto/business.dto';
import { SessionService } from 'src/auth/session.service';

@UseGuards(JwtGuard)
@Controller('business')
@ApiBearerAuth('JWT-auth')
@ApiBadRequestResponse({
  description: 'Something wrong happened',
})
@ApiTags('business')
export class BusinessController {

  constructor(
    private businessService: BusinessService,
    private sessionService: SessionService
  ) { }


  @ApiCreatedResponse({
    description: 'Get all businesses',
    type: AllBusinessDto,
  })
  @Get('allbusiness')
  async getAllBusiness(@Request() req: any) {
    const { sessionPublicId } = req.user;
    const user = await this.sessionService.getSessionUserBySessionPublicId(sessionPublicId);
    return this.businessService.getAllBusiness(user.orderingUserId);
  }

  @ApiCreatedResponse({
    description: 'Get a specific business',
    type: BusinessDto,
  })
  @Get(':businessId')
  async getBusinessById(@Request() req: any, @Param('businessId') publicBusinessId: string) {
    const { sessionPublicId } = req.user;
    const user = await this.sessionService.getSessionUserBySessionPublicId(sessionPublicId);
    return await this.businessService.getBusinessById(user.orderingUserId, publicBusinessId);
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
    const { publicBusinessId, status } = body;
    const { sessionPublicId } = req.user;
    const user = await this.sessionService.getSessionUserBySessionPublicId(sessionPublicId);
    return this.businessService.setTodayScheduleStatus(user.orderingUserId, publicBusinessId, status);
  }
}
