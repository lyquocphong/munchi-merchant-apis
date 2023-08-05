import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [OrderingIoModule, UserModule, AuthModule],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
