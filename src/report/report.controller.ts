// report/report.controller.ts

import { Body, Controller, Post, UseGuards, Request, Logger } from '@nestjs/common';
import { ReportAppBusinessDto, ReportAppStateDto } from './dto/report.dto';
import { NotificationService } from '../notification/notification.service'; // Adjust the import path based on your file structure
import { AppState } from './report.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { SessionService } from 'src/auth/session.service';

@ApiTags('report')
@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly sessionService: SessionService
  ) { }

  // @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtGuard)
  // @Post('app-state')
  // async reportAppState(@Body() reportAppStateDto: ReportAppStateDto, @Request() req: any) {
  //   const { userId } = req.user;

  //   if (reportAppStateDto.state === AppState.BACKGROUND) {
  //     this.logger.warn(`create open app notification for user ${userId}, deviceId: ${reportAppStateDto.deviceId}` );
  //     await this.notificationService.createOpenAppNotification(reportAppStateDto, userId);
  //   } else if (reportAppStateDto.state === AppState.ACTIVE) {
  //     this.logger.warn(`remove open app notification for device: ${reportAppStateDto.deviceId}` );
  //     await this.notificationService.removeOpenAppNotifications(reportAppStateDto.deviceId);
  //   }

  //   return { message: 'App state reported successfully' };
  // }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post('app-state')
  async reportSelectedBusiness(@Body() reportAppBusinessDto: ReportAppBusinessDto, @Request() req: any) {
    const { sessionPublicId } = req.user;
    await this.sessionService.setBusinessForSession(sessionPublicId, reportAppBusinessDto);
    return { message: 'App businesses reported successfully' };
  }
}
