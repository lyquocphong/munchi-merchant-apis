import { Controller, Get, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { HistoryService } from './history.service';
import { Historyquery } from './dto/history,dto';

@UseGuards(JwtGuard)
@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}
  @Get()
  getOrderHistory(@Query(new ValidationPipe()) dateQuery: Historyquery, @Request() request: any) {
    const { sessionPublicId } = request.user;
    return this.historyService.getOrderHistory(sessionPublicId, dateQuery);
  }
}
