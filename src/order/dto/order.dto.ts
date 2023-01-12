import {
  Exclude,
  Expose,
  Transform,
  Type,
} from 'class-transformer';
import moment, { Moment } from 'moment';
import { ProductDto } from './product.dto';

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
  @Type(() => ProductDto)
  products: ProductDto[];

  constructor(partial: Partial<OrderDto>) {
    Object.assign(this, partial);
  }
}