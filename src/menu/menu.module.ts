import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  providers: [MenuService, ProviderModule],
  controllers: [MenuController],
})
export class MenuModule {}
