// report/report.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { ReportAppStateDto } from './dto/report.dto';
import { NotificationService } from '../notification/notification.service'; // Adjust the import path based on your file structure
import { AppState } from './report.type';

@Controller('report')
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
}
