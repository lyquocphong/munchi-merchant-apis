import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { CmsModule } from 'src/cms/cms.module';
import { OrderModule } from 'src/order/order.module';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { WebhookModule } from 'src/webhook/webhook.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportModule } from 'src/report/report.module';
import { ScheduleModule as CustomScheduleModule } from 'src/schedule/schedule.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from 'src/notification/notification.module';
import { LoggerModule } from 'nestjs-pino';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    CmsModule,
    BusinessModule,
    ProviderModule,
    PrismaModule,
    OrderModule,
    UserModule,
    WebhookModule,
    AuthModule,
    ReportModule,
    ScheduleModule.forRoot(),
    NotificationModule,
    CustomScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
