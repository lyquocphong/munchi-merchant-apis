import { Injectable } from '@nestjs/common';
import { OrderingCategory, OrderingCategoryProduct } from 'src/menu/dto/menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderingMenuMapperService {
  constructor(private prismaService: PrismaService) {}

  mapToWoltCategory(orderingCategory: OrderingCategory) {
    const woltProducts = this.mapToWoltItem(orderingCategory.products);

    return {
      id: orderingCategory.id,
      name: orderingCategory.name,
      description: orderingCategory.description,
      items: woltProducts,
    };
  }

  mapToWoltItem(orderingCategoryProducts: OrderingCategoryProduct[]) {
    // orderingCategoryProducts.map((orderingCategoryproduct: OrderingCategoryProduct) => {
    //     const WoltOption = orderingCategoryproduct.extras.
    // })
  }
}
