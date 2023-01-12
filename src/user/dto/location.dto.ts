import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class LocationDto {
  @Expose() lat: number;
  @Expose() lng: number;

  constructor(partial: Partial<LocationDto>) {
    Object.assign(this, partial);
  }
}
