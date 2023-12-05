import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { NotificationModule } from '../notification/notification.module'; // Adjust the import path based on your file structure
import { SessionService } from 'src/auth/session.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { OrderingModule } from 'src/ordering/ordering.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [NotificationModule, AuthModule, UserModule, OrderingModule, JwtModule],
  controllers: [ReportController],
  providers: [SessionService],
})
export class ReportModule {}
