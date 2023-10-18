import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { OrderDto } from 'src/order/dto/order.dto';


@Injectable()
export class ReportService {
  constructor( private readonly mailService: MailService) {}
  async sendWeeklyReportEmail() {
  
    return await this.mailService.sendEmail()
  }

  async calcuclateReportData(order: OrderDto[]) {
    //calculate order number here than return necessary values
    
  }
}

