import { Exclude, Expose, Type } from 'class-transformer';
import { LocationDto } from './location.dto';

@Exclude()
export class AddressDto {
  @Expose() id: number;
  @Expose() address: string;
  @Expose()
  @Type(() => LocationDto)
  location: LocationDto[];

  constructor(partial: Partial<AddressDto>) {
    Object.assign(this, partial);
  }
}
