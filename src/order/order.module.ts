import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { OrderingModule } from 'src/ordering/ordering.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { BusinessModule } from 'src/business/business.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UtilsModule, OrderingModule, BusinessModule, UserModule, AuthModule],
  controllers: [OrderController],
  providers: [JwtStrategy, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
