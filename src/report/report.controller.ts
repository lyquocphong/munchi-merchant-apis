// report/report.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportAppBusinessDto, ReportAppStateDto } from './dto/report.dto';
import { NotificationService } from '../notification/notification.service'; // Adjust the import path based on your file structure
import { AppState } from './report.type';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
@Controller('report')
@ApiTags('report')
export class ReportController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('app-state') // Route: /report/app-state (POST)
  async reportAppState(@Body() report: ReportAppStateDto) {
    if (report.state === AppState.BACKGROUND) {
      await this.notificationService.createOpenAppNotification(report.deviceId);
    } else if (report.state === AppState.ACTIVE) {
      await this.notificationService.removeOpenAppNotifications(report.deviceId);
    }
    
    return { message: 'App state reported successfully' };
  }

  @Post('app-business') // Route: /report/app-state (POST)
  async reportAppBusiness(@Body() report: ReportAppBusinessDto) {
    
    //TODO: Check if device and session id is exist    
    
    return { message: 'App state reported successfully' };
  }
}
