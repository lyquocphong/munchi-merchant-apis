import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { ProviderModule } from 'src/provider/provider.module';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ProviderModule, AuthModule, UserModule],
  providers: [MenuService, JwtStrategy],
  controllers: [MenuController],
})
export class MenuModule {}
