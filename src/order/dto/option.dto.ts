import { Exclude, Expose, Type } from 'class-transformer';
import { SubOptionDto } from './suboption.dto';

@Exclude()
export class OptionDto {
  @Expose()
  id: number | string;
  @Expose()
  name: string;

  @Expose()
  image: number;

  @Expose()
  price: number | string;

  @Expose()
  @Type(() => SubOptionDto)
  suboptions: SubOptionDto[];

  constructor(partial: Partial<OptionDto>) {
    Object.assign(this, partial);
  }
}
