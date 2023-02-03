import { Module,Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategy';
import { BusinessModule } from 'src/business/business.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderingIoService } from './ordering.io.service';

@Global()
  @Module({
  imports: [BusinessModule],
  providers: [OrderingIoService, JwtStrategy],
  exports: [OrderingIoService],
})
export class OrderingIoModule {}
