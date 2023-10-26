import { Global, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsService } from './utils.service';
import { UserModule } from 'src/user/user.module';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

@Global()
@Module({
  imports: [AuthModule, UserModule, OrderingIoModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
