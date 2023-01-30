import { Module } from '@nestjs/common';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderController } from './order.controller';


@Module({
  imports: [UtilsModule, OrderingIoModule],
  controllers: [OrderController],
  
})
export class OrderModule {}
