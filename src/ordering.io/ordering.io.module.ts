import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategy';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderingIoService } from './ordering.io.service';

@Module({
  imports: [UtilsModule],
  providers: [OrderingIoService, JwtStrategy],
  exports: [OrderingIoService],
})
export class OrderingIoModule {}
