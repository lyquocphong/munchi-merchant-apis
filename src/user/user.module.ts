import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
@Module({
  imports: [UtilsModule,OrderingIoModule],
  controllers: [UserController],
 
})
export class UserModule {}
