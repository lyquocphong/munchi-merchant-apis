import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderingMenuCategory } from '../ordering/dto/ordering-menu.dto';
import { WoltCategory as WoltMenuCategory } from './dto/wolt-menu.dto';

@Injectable()
export class WoltMenuMapperService {
  constructor() {}

  mapToOrderingCategory(woltCategory: WoltMenuCategory): OrderingMenuCategory{
    return
  }
}
