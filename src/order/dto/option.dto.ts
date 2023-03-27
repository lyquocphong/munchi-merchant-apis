import { Exclude, Expose, Type } from 'class-transformer';
import { SubOptionDto } from './suboption.dto';

@Exclude()
export class OptionDto {
    @Expose()
    id: number;
  @Expose()
  name: number;

  @Expose()
  image: number;

  @Expose()
  price: number;

  @Expose()
  @Type(() => SubOptionDto)
  suboptions: SubOptionDto[];

 
  constructor(partial: Partial<OptionDto>) {
    Object.assign(this, partial);
  }
}
