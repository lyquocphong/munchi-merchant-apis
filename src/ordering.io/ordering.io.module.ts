import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { BusinessModule } from 'src/business/business.module';
import { UserModule } from 'src/user/user.module';
import { OrderingIoService } from './ordering.io.service';

@Module({
  imports: [forwardRef(() => BusinessModule), forwardRef(() => UserModule), forwardRef(() => AuthModule)],
  providers: [OrderingIoService],
  exports: [OrderingIoService],
})
export class OrderingIoModule {}
