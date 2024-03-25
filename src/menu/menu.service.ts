import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { BusinessService } from 'src/business/business.service';
import { OrderingMenuCategory } from 'src/provider/ordering/dto/ordering-menu.dto';
import { OrderingMenuMapperService } from 'src/provider/ordering/ordering-menu-mapper';
import { OrderingService } from 'src/provider/ordering/ordering.service';
import { ProviderEnum } from 'src/provider/provider.type';
import { MenuData, WoltCategory, WoltMenuData } from 'src/provider/wolt/dto/wolt-menu.dto';
import { WoltService } from 'src/provider/wolt/wolt.service';
import { UtilsService } from 'src/utils/utils.service';
import { MenuCategoryDto } from './dto/menu.dto';
import { WoltMenuMapperService } from 'src/provider/wolt/wolt-menu-mapper';

@Injectable()
export class MenuService {
  constructor(
    private orderingService: OrderingService,
    private orderingMenuMapperService: OrderingMenuMapperService,
    private woltMenuMapperService: WoltMenuMapperService,
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
    await this.orderingService.syncMenu(woltVenue[0].providerId, orderingUserId, woltMenuData);

    return woltMenuData;
  }

  async getWoltMenuCategory(orderingUserId: number, publicBusinessId: string) {
    const orderingAccessToken = await this.utilService.getOrderingAccessToken(orderingUserId);

    //Get business by public id
    const business = await this.businessService.findBusinessByPublicId(publicBusinessId);

    const orderingBusinessId = business.orderingBusinessId;

    const woltVenue = business.provider.filter(
      (provider: Provider) => provider.name === ProviderEnum.Wolt,
    );

    const woltMenuData = await this.woltService.getMenuCategory(
      orderingUserId,
      woltVenue[0].providerId,
    );

    if (woltMenuData.status === 'READY') {
      const orderingCategoryData = this.woltMenuMapperService.mapToOrderingCategory(woltMenuData);

      const newExtra = await this.orderingService.createProductsExtraField(
        orderingAccessToken,
        orderingBusinessId,
      );
      const newExtraId = typeof newExtra.id === 'number' ? newExtra.id.toString() : newExtra.id;

      // Create category

      orderingCategoryData.map(async (category: any) => {
        const newCategory = await this.orderingService.createCategory(
          orderingAccessToken,
          orderingBusinessId,
          category,
        );
        console.log('🚀 ~ MenuService ~ orderingCategoryData.map ~ newCategory:', newCategory);

        const newCategoryId =
          typeof newCategory.id === 'number' ? newCategory.id.toString() : newCategory.id;

        // Create products
        category.products.map(async (product: any) => {
          if (product.options.length === 0 || product.option_bindings.length === 0) {
            return;
          } else {
            product.options.map(async (option: any) => {
              const newOption = await this.orderingService.createProductOptions(
                orderingAccessToken,
                orderingBusinessId,
                newExtraId,
                option,
              );
              const newOptionId =
                typeof newOption.id === 'number' ? newOption.id.toString() : newOption.id;

              option.values.map(async (value: any) => {
                const newSubOptions = await this.orderingService.createProductOptionsSuboptions(
                  orderingAccessToken,
                  orderingBusinessId,
                  newExtraId,
                  newOptionId,
                  value,
                );
              });
            });
          }

          // Create product
          const newProduct = await this.orderingService.createProducts(
            orderingAccessToken,
            orderingBusinessId,
            newCategory.id,
            product,
          );

          const newProductId =
            typeof newProduct.id === 'number' ? newProduct.id.toString() : newProduct.id;

          const extras = await this.orderingService.getProductExtras(
            orderingAccessToken,
            orderingBusinessId,
          );
          console.log("🚀 ~ MenuService ~ category.products.map ~ extras:", extras)

          // Edit product
          // const updatedProduct = await this.orderingService.editProduct(
          //   orderingAccessToken,
          //   orderingBusinessId,
          //   newCategoryId,
          //   newProductId,
          //   { extras: [newExtraId] },
          // );
        });

        // Create extra fields

        // Create options

        // Create suboptions
      });

      return orderingCategoryData;
    }

    // Need to check  if the order has a any menu or not

    // If no create a menu then use that menu object to add menu category
    // Then product => options => suboption
    // Sync data from wolt to ordering

    return woltMenuData;
  }

  async getMatchingService(
    sourceProvider: string,
    destinationProvider: string,
    menuCategory: any,
  ): Promise<string | null> {
    switch (sourceProvider) {
      case 'Ordering':
        // if (destinationProvider === 'Wolt') {
        //   return syncMenuOrderingToWolt(option);
        // } else if (destinationProvider === 'UberEats') {
        //   return syncMenuOrderingToUberEats(option);
        // }
        break;
      case 'Wolt':
        // ... Add logic for Wolt as source
        break;
      case 'UberEats':
        // ... Add logic for UberEats as source
        break;
      default:
        console.error('Unsupported provider:', sourceProvider);
        return null;
    }

    // If provider and direction are supported, but no option match is found:
    return null;
  }

  async getBusinessProduct(orderingUserId: number, publicBusinessId: string) {
    // Get access token
    const orderingAccessToken = await this.utilService.getOrderingAccessToken(orderingUserId);

    const business = await this.businessService.findBusinessByPublicId(publicBusinessId);

    const categoryData = await this.orderingService.getMenuCategory(
      orderingAccessToken,
      business.orderingBusinessId,
    );

    //Format category data to product data
    const mappedCategoryData = plainToInstance(MenuCategoryDto, categoryData);

    return mappedCategoryData;
  }

  async deleteAllCategory(orderingUserId: number, publicBusinessId: string) {
    // Get access token
    const orderingAccessToken = await this.utilService.getOrderingAccessToken(orderingUserId);

    const business = await this.businessService.findBusinessByPublicId(publicBusinessId);

    const categories = await this.orderingService.getMenuCategory(
      orderingAccessToken,
      business.orderingBusinessId,
    );

    const productExtras = await this.orderingService.getProductExtras(
      orderingAccessToken,
      business.orderingBusinessId,
    );

    productExtras.map(async (category) => {
      await this.orderingService.deleteProductExtras(
        orderingAccessToken,
        business.orderingBusinessId,
        category.id.toString(),
      );
    });

    categories.map(async (category) => {
      await this.orderingService.deleteMenuCategory(
        orderingAccessToken,
        business.orderingBusinessId,
        category.id.toString(),
      );
    });
  }
}
