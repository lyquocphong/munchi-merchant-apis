import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from 'src/order/order.module';
import { HttpModule } from '@nestjs/axios';
import { OrderWebhookModule } from 'src/order_webhook/order_webhook.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    OrderModule,
    UserModule,
    HttpModule,
    OrderWebhookModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
