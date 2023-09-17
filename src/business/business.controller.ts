import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  constructor(private businessService: BusinessService, private sessionService: SessionService) { }

  @ApiAcceptedResponse({
    description: 'Get all businesses',
  })
  @Get('allbusiness')
  async getAllBusiness(@Request() req: any): Promise<BusinessDto[]> {
    const { sessionPublicId } = req.user;
    const user = await this.sessionService.getSessionUserBySessionPublicId(sessionPublicId);
    return this.businessService.getAllBusiness(user.orderingUserId);
  }

  @ApiCreatedResponse({
    description: 'Get business in session',
  })
  @Get('session-business')
  async getBusinessInSession(@Request() req: any) {
    const { sessionPublicId } = req.user;
    const findSessionArgs = Prisma.validator<Prisma.SessionFindFirstArgsBase>()({
      select: {
        businesses: {
          select: {
            publicId: true,
          },
        },
      },
    });

    const session = await this.sessionService.getSessionByPublicId<
      Prisma.SessionGetPayload<typeof findSessionArgs>
    >(sessionPublicId, findSessionArgs);

    return session.businesses;
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
  async setOnlineStatus(@Request() req: any, @Body() body: SetOnlineStatusDto) {
    const { status, duration, id: publicBusinessId } = body;
    console.log(duration);
    if (status === false && !duration) {
      throw new BadRequestException('duration is needed when status is false');
    }

    const { userPublicId } = req.user;
    return this.businessService.setOnlineStatusByPublicId(
      userPublicId,
      publicBusinessId,
      status,
      duration,
    );
  }
}
