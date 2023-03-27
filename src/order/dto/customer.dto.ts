import { Exclude, Expose } from 'class-transformer';

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
  constructor(partial: Partial<CustomerDto>) {
    Object.assign(this, partial);
  }
}
