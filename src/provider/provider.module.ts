import { Module } from '@nestjs/common';
import { OrderingService } from './ordering/ordering.service';
import { WoltService } from './wolt/wolt.service';

@Module({
  providers: [OrderingService, WoltService],
  exports: [OrderingService, WoltService],
})
export class ProviderModule {}
