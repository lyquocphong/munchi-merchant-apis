import {
  Exclude,
  Expose,
  Type,
} from 'class-transformer';

@Exclude()
export class ProductDto {
  @Expose({ name: 'product_id' })
  id: number;

  @Expose()
  name: number;

  @Expose()
  price: number;

  @Expose()
  comment: number;

  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }
}
