import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class SummaryDto {
  @Expose()
  tax: number;

  @Expose()
  total: number;

  @Expose()
  delivery_price: number;

  constructor(partial: Partial<SummaryDto>) {
    Object.assign(this, partial);
  }
}
