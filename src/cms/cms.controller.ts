import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  @Get('getPage')
  getPage(@Request() req: any) {
    const { userId } = req.user;
    return this.cmsService.getPage(userId);
  }
}
