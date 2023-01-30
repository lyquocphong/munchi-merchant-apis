import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [ UtilsModule, OrderingIoModule],
  controllers: [AuthController],
})
export class AuthModule {}
