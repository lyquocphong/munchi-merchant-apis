import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

@Module({
  imports: [OrderingIoModule],
  controllers: [CmsController],
  providers: [CmsService]
})
export class CmsModule {}
