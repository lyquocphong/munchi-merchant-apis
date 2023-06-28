import { Module, forwardRef } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

@Module({
  imports: [forwardRef(() => OrderingIoModule)],
  controllers: [BusinessController],
  providers: [BusinessService, JwtStrategy],
  exports: [BusinessService],
})
export class BusinessModule {}
