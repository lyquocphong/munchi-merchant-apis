import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UserModule } from 'src/user/user.module';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
  imports: [OrderingIoModule, UserModule],
  controllers: [BusinessController],
  providers: [BusinessService, JwtStrategy],
  exports: [BusinessService],
})
export class BusinessModule {}
