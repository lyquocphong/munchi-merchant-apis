import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

import { UtilsService } from './utils.service';

@Module({
  imports: [forwardRef(() => OrderingIoModule)],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
