import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';
import { CmsModule } from 'src/cms/cms.module';
import { OrderModule } from 'src/order/order.module';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { OrderWebhookModule } from 'src/webhook/webhook.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportModule } from 'src/report/report.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CmsModule,
    BusinessModule,
    OrderingIoModule,
    PrismaModule,
    OrderModule,
    UserModule,
    OrderWebhookModule,
    AuthModule,
    ReportModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
