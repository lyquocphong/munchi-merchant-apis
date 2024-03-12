import { Injectable } from '@nestjs/common';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class MenuService {
  constructor(private orderingService: OrderingService, private utilService: UtilsService) {}
  async getMenuCategory(orderingUserId: number) {
    const orderingAccessToken = await this.utilService.getOrderingAccessToken(orderingUserId);
    const menu = await this.orderingService.getMenuCategory(orderingAccessToken, '351');
    return menu;
  }
}
