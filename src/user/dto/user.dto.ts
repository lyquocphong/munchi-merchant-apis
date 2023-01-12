import { Exclude, Expose, Type } from 'class-transformer';
import { AddressDto } from './address.dto';

@Exclude()
export class UserDto {
  @Expose() id: number;

  @Expose() name: string;

  @Expose() lastname: string;

  @Expose() email: string;

  @Expose() level: number;

  @Expose()
  @Type(() => AddressDto)
  addresses: AddressDto[];

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
