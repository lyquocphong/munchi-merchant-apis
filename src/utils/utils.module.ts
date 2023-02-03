import { Module,Global } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { JwtModule } from '@nestjs/jwt';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

import { UtilsService } from './utils.service';
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
