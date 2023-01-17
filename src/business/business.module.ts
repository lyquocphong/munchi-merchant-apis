import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { UtilsService } from 'src/utils/utils.service';

import { BusinessController } from './business.controller';
import { BusinessService } from './business.service.';

@Module({
  imports: [UtilsModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
