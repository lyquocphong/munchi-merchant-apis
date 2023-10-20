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
import { ConfigService } from '@nestjs/config';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';

@ApiTags('report')
@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly sessionService: SessionService,
    private readonly reportService: ReportService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
    private readonly orderingService: OrderingIoService,
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
    //Get ordering api key
    const orderingApiKey = this.configService.get('ORDERING_API_KEY');

    //TODO:get business or business  list here
    const businesses = await this.orderingService.getAllBusiness('',orderingApiKey); //business array
    // console.log(juicyBurger)
    //TODO: calculate data here as well
    //TODO: pass business data and reportData to sendWeeklyReportEmail
    // pass reportId into sendWeeklyReport
    // await this.reportService.sendWeeklyReport()
    return { message: 'send email successully' };
  }
}
