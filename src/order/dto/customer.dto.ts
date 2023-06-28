import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerDto {
  @Expose()
  name: number;

  @Expose({ name: 'lastname' })
  lastName: number;

  @Expose()
  email: number;

  @Expose()
  address: string;

  @Expose({ name: 'address_notes' })
  addressNotes: string;

  @Expose({ name: 'cellphone' })
  phone: string;

  constructor(partial: Partial<CustomerDto>) {
    Object.assign(this, partial);
  }
}
