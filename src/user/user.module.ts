import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Global()
@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService,JwtStrategy],
  exports: [UserService]
})
export class UserModule {}
