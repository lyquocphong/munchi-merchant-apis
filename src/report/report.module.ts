import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { NotificationModule } from '../notification/notification.module'; // Adjust the import path based on your file structure
import { SessionService } from 'src/auth/session.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { JwtModule } from '@nestjs/jwt';
import { ReportService } from './report.service';
import { MailModule } from 'src/mail/mail.module';
import { BusinessModule } from 'src/business/business.module';

@Module({
  imports: [NotificationModule, AuthModule, UserModule, OrderingIoModule, JwtModule, MailModule, BusinessModule, OrderingIoModule],
  controllers: [ReportController],
  providers: [SessionService, ReportService],
})
export class ReportModule { }
