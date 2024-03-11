import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { ProviderModule } from 'src/provider/provider.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  providers: [MenuService, ProviderModule, JwtStrategy],
  controllers: [MenuController],
})
export class MenuModule {}
