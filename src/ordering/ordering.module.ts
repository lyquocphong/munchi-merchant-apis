/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { OrderingService } from './ordering.service';

@Module({
  providers: [OrderingService],
  exports: [OrderingService],
})
export class OrderingModule {}
