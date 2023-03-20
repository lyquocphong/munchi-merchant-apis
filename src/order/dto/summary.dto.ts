import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class SummaryDto {
  @Expose()
  tax: number;

  @Expose()
  total: number;
  @Expose()
  discount: number;

  @Expose({ name: 'delivery_price' })
  deliveryPrice: number;

  @Expose({ name: 'service_fee' })
  serviceFee: number;

  constructor(partial: Partial<SummaryDto>) {
    Object.assign(this, partial);
  }
}
