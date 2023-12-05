import { Module, forwardRef } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { OrderingModule } from 'src/ordering/ordering.module';
import { UserModule } from 'src/user/user.module';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { AuthModule } from 'src/auth/auth.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [OrderingModule, UserModule, AuthModule, forwardRef(() => QueueModule)],
  controllers: [BusinessController],
  providers: [BusinessService, JwtStrategy],
  exports: [BusinessService],
})
export class BusinessModule {}
