import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { OrderingModule } from 'src/ordering/ordering.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [OrderingModule, UserModule, AuthModule],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
