import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderController } from './order.controller';

@Module({
  imports: [UtilsModule, OrderingIoModule],
  controllers: [OrderController],
  providers: [JwtStrategy],
})
export class OrderModule {}
