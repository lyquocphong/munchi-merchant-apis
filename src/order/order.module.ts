import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { BusinessModule } from 'src/business/business.module';

@Module({
  imports: [UtilsModule, OrderingIoModule, BusinessModule],
  controllers: [OrderController],
  providers: [JwtStrategy, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
