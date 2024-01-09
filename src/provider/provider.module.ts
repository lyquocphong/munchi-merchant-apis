import { Module } from '@nestjs/common';
import { OrderingService } from './ordering/ordering.service';
import { ProviderManagmentService } from './provider-management.service';
import { WoltService } from './wolt/wolt.service';

@Module({
  providers: [ProviderManagmentService, OrderingService, WoltService],
  exports: [OrderingService, WoltService, ProviderManagmentService],
})
export class ProviderModule {}
