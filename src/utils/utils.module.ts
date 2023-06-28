/* eslint-disable prettier/prettier */
import { Module, Global } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { OrderingIoModule } from 'src/ordering.io/ordering.io.module';

import { UtilsService } from './utils.service';
@Global()
@Module({
  imports: [JwtModule.register({}), OrderingIoModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
