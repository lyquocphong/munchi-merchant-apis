/* eslint-disable prettier/prettier */
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OwnerDto {
  @Expose() id: number;

  @Expose() name: string;

  @Expose() lastname: string;

  @Expose() email: string;

  @Expose() level: number;

  constructor(partial: Partial<OwnerDto>) {
    Object.assign(this, partial);
  }
}
