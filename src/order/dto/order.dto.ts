import { Exclude, Expose, Type } from 'class-transformer';
import { CustomerDto } from './customer.dto';
import { ProductDto } from './product.dto';
import { SummaryDto } from './summary.dto';
import { HistoryDto } from './history.dto';
import { BusinessDto } from 'src/business/dto/business.dto';

@Exclude()
export class OrderDto {
  @Expose()
  id: number;

  @Expose({ name: 'paymethod_id' })
  paymethodId: number;

  @Expose({ name: 'business_id' })
  businessId: number;

  @Expose({ name: 'customer_id' })
  customerId: number;

  @Expose()
  status: number;

  @Expose({ name: 'delivery_type' })
  deliveryType: number;

  @Expose({ name: 'delivery_datetime' })
  deliveryTime: number;

  @Expose({ name: 'prepared_in' })
  preparedIn: number;

  @Expose({ name: 'created_at' })
  createdAt: string;

  @Expose({ name: 'spot_number' })
  table: number;

  @Expose()
  @Type(() => SummaryDto)
  summary: SummaryDto[];

  @Expose()
  @Type(() => ProductDto)
  products: ProductDto[];

  @Expose()
  @Type(() => CustomerDto)
  customer: CustomerDto[];

  @Expose()
  @Type(() => HistoryDto)
  history: HistoryDto[];

  @Expose()
  business: BusinessDto;

  @Expose()
  comment: string;


  @Expose()
  offers: any;

  constructor(partial: Partial<OrderDto>) {
    Object.assign(this, partial);
  }
}
