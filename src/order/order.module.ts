import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [UtilsModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
