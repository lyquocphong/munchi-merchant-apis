import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CustomerDto {
  @Expose()
  name: number;
  @Expose({name:'lastname'})
  lastName: number;
  @Expose()
  email: number;
  @Expose()
  address: number;
  @Expose({ name: 'orders_count' })
  ordersCount: number;

  constructor(partial: Partial<CustomerDto>) {
    Object.assign(this, partial);
  }
}
