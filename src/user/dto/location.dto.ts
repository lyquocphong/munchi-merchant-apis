import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LocationDto {
  @Expose() lat: number;
  @Expose() lng: number;

  constructor(partial: Partial<LocationDto>) {
    Object.assign(this, partial);
  }
}
