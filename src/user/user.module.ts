import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';
@Module({
  controllers: [UserController],
})
export class UserModule {}
