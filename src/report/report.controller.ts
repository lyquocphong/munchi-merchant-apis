// report/report.controller.ts

import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ReportAppStateDto } from './dto/report.dto';
import { NotificationService } from '../notification/notification.service'; // Adjust the import path based on your file structure
import { AppState } from './report.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post('app-state')
  async reportAppState(@Body() reportAppStateDto: ReportAppStateDto, @Request() req: any) {
    const { userId } = req.user;
    
    if (reportAppStateDto.state === AppState.BACKGROUND) {
      await this.notificationService.createOpenAppNotification(reportAppStateDto, userId);
    } else if (reportAppStateDto.state === AppState.ACTIVE) {
      await this.notificationService.removeOpenAppNotifications(reportAppStateDto.deviceId);
    }
    
    return { message: 'App state reported successfully' };
  }
}
