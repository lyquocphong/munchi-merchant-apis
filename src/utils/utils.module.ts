import { Global, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsService } from './utils.service';

@Global()
@Module({
  imports: [AuthModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
