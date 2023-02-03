import { Module } from '@nestjs/common';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UtilsModule } from 'src/utils/utils.module';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';


@Module({
  controllers: [BusinessController],
  providers: [BusinessService],
  exports:[BusinessService]
})
export class BusinessModule {}
