import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from 'src/order/order.module';
import { OrderWebhookModule } from 'src/webhook/webhook.module';
import { UserModule } from 'src/user/user.module';
import { BusinessModule } from 'src/business/business.module';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BusinessModule,
    AuthModule,
    PrismaModule,
    OrderModule,
    UserModule,
    OrderWebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
