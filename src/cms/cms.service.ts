import { Injectable } from '@nestjs/common';
import { OrderingService } from 'src/provider/ordering.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class CmsService {
  constructor(private utils: UtilsService, private OrderingService: OrderingService) {}
  async getPage(userId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    // getPage from ordering
    return await this.OrderingService.getPage(accessToken);
    //return getPage to client
  }
}
