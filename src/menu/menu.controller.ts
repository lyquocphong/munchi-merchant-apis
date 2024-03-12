import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @UseGuards(JwtGuard)
  @Get('category')
  getMenuCategory(@Req() request: any) {
    const { orderingUserId } = request.user;
    return this.menuService.getMenuCategory(orderingUserId);
  }
}
