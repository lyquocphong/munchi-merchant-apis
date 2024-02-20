import { Module } from '@nestjs/common';
import { FinancialAnalyticsService } from './financial-analytics.service';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [OrderModule],
  providers: [FinancialAnalyticsService],
  exports: [FinancialAnalyticsService],
})
export class FinancialAnalyticsModule {}
