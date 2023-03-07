import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';


@Module({
  controllers: [BusinessController],
  providers: [BusinessService,JwtStrategy],
  exports:[BusinessService]
})
export class BusinessModule {}
