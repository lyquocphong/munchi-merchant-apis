import { Controller, Delete, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Response } from 'express';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @UseGuards(JwtGuard)
  @Get('category')
  getMenuCategory(@Req() request: any, @Query('businessPublicId') businessPublicId: string) {
    const { orderingUserId } = request.user;
    return this.menuService.getMenuCategory(orderingUserId, businessPublicId);
  }

  @UseGuards(JwtGuard)
  @Get('category/wolt')
  getWoltMenuCategory(@Req() request: any, @Query('businessPublicId') businessPublicId: string) {
    const { orderingUserId } = request.user;
    return this.menuService.getWoltMenuCategory(orderingUserId, businessPublicId);
  }

  @UseGuards(JwtGuard)
  @Get('product')
  getBusinessProduct(@Req() request: any, @Query('businessPublicId') businessPublicId: string) {
    const { orderingUserId } = request.user;
    return this.menuService.getBusinessProduct(orderingUserId, businessPublicId);
  }

  @UseGuards(JwtGuard)
  @Delete('ordering/category')
  async deleteAllOrderingCategory(
    @Req() request: any,
    @Query('businessPublicId') businessPublicId: string,
    @Res() response: Response,
  ) {
    const { orderingUserId } = request.user;
    await this.menuService.deleteAllCategory(orderingUserId, businessPublicId);

    response.status(200).send('Success');
  }

}
