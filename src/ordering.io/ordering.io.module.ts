/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { OrderingIoService } from './ordering.io.service';

@Module({
  providers: [OrderingIoService],
  exports: [OrderingIoService],
})
export class OrderingIoModule {}
