import { Injectable } from '@nestjs/common';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class CmsService {
  constructor(private utils: UtilsService, private orderingIoService: OrderingIoService) {}
  async getPage(userId: number) {
    const accessToken = await this.utils.getOrderingAccessToken(userId);
    // getPage from ordering
    return await this.orderingIoService.getPage(accessToken);
    //return getPage to client
  }
}
