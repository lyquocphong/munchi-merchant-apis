import { Module,Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

import { BusinessModule } from 'src/business/business.module';
import { UserModule } from 'src/user/user.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderingIoService } from './ordering.io.service';

@Global()
  @Module({
  imports: [BusinessModule,UserModule,AuthModule],
  providers: [OrderingIoService],
  exports: [OrderingIoService],
})
export class OrderingIoModule {}
