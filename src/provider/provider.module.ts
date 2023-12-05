import { Module } from '@nestjs/common';
import { OrderingService } from './ordering.service';
import { WoltService } from './wolt.service';

@Module({
  providers: [OrderingService, WoltService],
  exports: [OrderingService, WoltService],
})
export class ProviderModule {}
