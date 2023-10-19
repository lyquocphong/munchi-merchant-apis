import { Injectable } from '@nestjs/common';
import { Business } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { OrderDto } from 'src/order/dto/order.dto';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';


@Injectable()
export class ReportService {
  constructor(private readonly mailService: MailService,
    private readonly orderingService: OrderingIoService
  ) { }
  async sendWeeklyReportEmail(business: Business) {
    const filterData: any = {
      query: `"status":[11,15]`,
      paramsQuery: [
        'id',
        'business_id',
        'prepared_in',
        'customer_id',
        'status',
        'delivery_type',
        'delivery_datetime',
        'products',
        'summary',
        'customer',
        'created_at',
        'spot_number',
        'history',
        'delivery_datetime',
        'business',
        'reporting_data',
        'comment',
        'offers',
        'paymethod_id'
      ].join(','),
    }
    const order = await this.orderingService.getFilteredOrders('', 351, filterData.query, filterData.paramsQuery)
    const { orderQuantity, subTotal, subTotalWithDisount, total } = this.calculateReportData(order)
    return await this.mailService.sendEmail({
      recipient: 'test@test.com', data: {
        orderTotal: orderQuantity,
        subTotal: subTotal.toFixed(2),
        subTotalWithDisount: subTotalWithDisount.toFixed(2),
        total: total.toFixed(2)
      }
    })
  }

  calculateReportData(order: any) {
    //calculate order number here than return necessary values
    const orderQuantity = order.length
    const subTotal = order.reduce((a, b) => a + b.summary.subtotal, 0)
    const subTotalWithDisount = order.reduce((a, b) => a + b.summary.subtotal_with_discount, 0)
    const total = order.reduce((a, b) => a + b.summary.total, 0)
    return {
      orderQuantity,
      subTotal,
      subTotalWithDisount,
      total
    }
  }
}

