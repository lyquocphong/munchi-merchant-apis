import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { NotificationModule } from '../notification/notification.module'; // Adjust the import path based on your file structure

@Module({
  imports: [NotificationModule],
  controllers: [ReportController],
})
export class ReportModule {}