import { Exclude, Expose, Type } from 'class-transformer';
import { OptionDto } from './option.dto';

@Exclude()
export class ProductDto {
  @Expose({ name: 'product_id' })
  id: number;

  @Expose()
  name: number;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  @Expose()
  comment: string;

  @Expose()
  @Type(() => OptionDto)
  options: OptionDto[];

  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }
}
