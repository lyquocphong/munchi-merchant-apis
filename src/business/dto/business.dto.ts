import { Exclude, Expose, Type } from 'class-transformer';
import { OwnerDto } from './owner.dto';

@Exclude()
export class BusinessDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() slug: string;
  @Expose() address: string;
  @Expose() enabled: boolean;

  @Expose()
  @Type(() => OwnerDto)
  owners: OwnerDto[];
  constructor(partial: Partial<OwnerDto>) {
    Object.assign(this, partial);
  }
}
