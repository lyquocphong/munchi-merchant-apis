import { Module } from '@nestjs/common';
import { OrderingService } from './ordering/ordering.service';
import { ProviderManagmentService } from './provider-management.service';
import { WoltService } from './wolt/wolt.service';
import { WoltOrderMapperService } from './wolt/wolt-order-mapper';
import { WoltRepositoryService } from './wolt/wolt-repository';
import { WoltSyncService } from './wolt/wolt-sync';
import { OrderingOrderMapperService } from './ordering/ordering-order-mapper';
import { OrderingRepositoryService } from './ordering/ordering-repository';
import { OrderingSyncService } from './ordering/ordering-sync';

@Module({
  providers: [
    ProviderManagmentService,
    // Ordering Services
    OrderingService,
    OrderingOrderMapperService,
    OrderingRepositoryService,
    OrderingSyncService,
    // Wolt Services
    WoltService,
    WoltOrderMapperService,
    WoltRepositoryService,
    WoltSyncService,
  ],
  exports: [
    OrderingService,
    OrderingOrderMapperService,
    OrderingRepositoryService,
    WoltService,
    ProviderManagmentService,
    WoltOrderMapperService,
    WoltRepositoryService,
    WoltSyncService,
  ],
})
export class ProviderModule {}
