import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuService {
  constructor() {}
  async getMenu() {
    return 'get menu';
  }
}
