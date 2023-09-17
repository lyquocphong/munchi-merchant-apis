import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { BusinessModule } from 'src/business/business.module';
import { SessionService } from 'src/auth/session.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BusinessModule),
    AuthModule,
    UserModule,
    OrderingIoModule,
    JwtModule,
  ],
  providers: [NotificationService, OneSignalService, SessionService],
  exports: [NotificationService],
})
export class NotificationModule {}
