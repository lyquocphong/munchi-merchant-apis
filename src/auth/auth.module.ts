import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenStrategy } from './strategy/refreshJwt.strategy';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';

@Module({
  imports: [JwtModule.register({}), forwardRef( () => UserModule),forwardRef( () => OrderingIoModule)],
  controllers: [AuthController],
  providers: [AuthService,RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
