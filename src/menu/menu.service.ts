import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { BusinessService } from 'src/business/business.service';
import { OrderingMenuCategory } from 'src/provider/ordering/dto/ordering-menu.dto';
import { OrderingMenuMapperService } from 'src/provider/ordering/ordering-menu-mapper';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { ProviderEnum } from 'src/provider/provider.type';
import { WoltCategory, WoltMenuData } from 'src/provider/wolt/dto/wolt-menu.dto';
import { WoltService } from 'src/provider/wolt/wolt.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class MenuService {
  constructor(
    private orderingService: OrderingService,
    private orderingMenuMapperService: OrderingMenuMapperService,
    private businessService: BusinessService,
    private woltService: WoltService,
    private utilService: UtilsService,
  ) {}
  async getMenuCategory(orderingUserId: number, publicBusinessId: string) {
    // Get access token
    const orderingAccessToken = await this.utilService.getOrderingAccessToken(orderingUserId);

    //Get business by public id
    const business = await this.businessService.findBusinessByPublicId(publicBusinessId);

    const woltVenue = business.provider.filter(
      (provider: Provider) => provider.name === ProviderEnum.Wolt,
    );
    
    const menu = await this.orderingService.getMenuCategory(
      orderingAccessToken,
      business.orderingBusinessId,
    );

    //Map to wolt object and remove propertyn that has no product out of the result object
    const result: WoltCategory[] = menu
      .map((orderingCategory: OrderingMenuCategory) => {
        if (orderingCategory.products.length === 0) {
          return undefined; // Returns undefined
        }
        return this.orderingMenuMapperService.mapToWoltCategory(orderingCategory);
      })
      .filter(Boolean);

    const woltMenuData: WoltMenuData = {
      id: this.utilService.generatePublicId(),
      currency: 'EUR',
      primary_language: 'en',
      categories: result,
    };

    //Sync order to Wolt
    await this.woltService.syncMenu(woltVenue[0].providerId, orderingUserId, woltMenuData);

    return woltMenuData;
  }
}
