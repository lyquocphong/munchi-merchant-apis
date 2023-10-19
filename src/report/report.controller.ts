// report/report.controller.ts

import {
  Body,
  Controller,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { SessionService } from 'src/auth/session.service';
import { NotificationService } from '../notification/notification.service'; // Adjust the import path based on your file structure
import { ReportAppBusinessDto, ReportAppStateDto } from './dto/report.dto';
import { ReportService } from './report.service';
import { AppState } from './report.type';
import { BusinessService } from 'src/business/business.service';
import { Business } from '@prisma/client';

@ApiTags('report')
@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly sessionService: SessionService,
    private readonly reportService: ReportService,
    private readonly businessService: BusinessService,

  ) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post('app-state')
  async reportAppState(
    @Body() reportAppStateDto: ReportAppStateDto,
    @Request() req: any
  ) {
    const { sessionPublicId } = req.user;

    const isOnline = reportAppStateDto.state !== AppState.BACKGROUND;
    await this.sessionService.setSessionOnlineStatus(sessionPublicId, isOnline);

    return { message: 'App state reported successfully' };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post('app-business')
  async reportSelectedBusiness(
    @Body() reportAppBusinessDto: ReportAppBusinessDto,
    @Request() req: any
  ) {
    const { sessionPublicId } = req.user;
    await this.sessionService.setBusinessForSession(
      sessionPublicId,
      reportAppBusinessDto
    );
    return { message: 'App businesses reported successfully' };
  }

  @Post('weekly-report')
  async sendWeeklyReport() {
    //Todo;get business or business  list here

    const juicyBurger = await this.businessService.findBusinessByOrderingId(351,null)
    // console.log(juicyBurger)
    //Todo: calculate data here as well
    //Todo: pass business data and reportData to sendWeeklyReportEmail
    await this.reportService.sendWeeklyReportEmail(juicyBurger as Business)
    return { message: 'send email successully' };
  }
}
