import { Module } from '@nestjs/common';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UtilsModule } from 'src/utils/utils.module';
import { UtilsService } from 'src/utils/utils.service';

import { BusinessController } from './business.controller';


@Module({
  imports: [UtilsModule, OrderingIoModule],
  controllers: [BusinessController],
  // providers: [BusinessService],
})
export class BusinessModule {}
