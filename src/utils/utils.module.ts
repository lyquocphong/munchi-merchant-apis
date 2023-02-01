import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { JwtModule } from '@nestjs/jwt';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

import { UtilsService } from './utils.service';

@Module({
  imports: [forwardRef(() => OrderingIoModule),JwtModule.register({})],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
