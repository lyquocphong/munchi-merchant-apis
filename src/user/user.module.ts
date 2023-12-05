import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OrderingModule } from 'src/ordering/ordering.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => OrderingModule)],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
