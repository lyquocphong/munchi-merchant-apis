import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
  imports: [UtilsModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
