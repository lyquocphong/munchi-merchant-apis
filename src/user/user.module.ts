import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => OrderingIoModule)],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
