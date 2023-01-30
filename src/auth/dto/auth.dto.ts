import {
  Exclude,
  Expose,
  Type,
} from 'class-transformer';
import { SessionDto } from './session.dto';

@Exclude()
export class AuthDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose({name:'lastname'}) lastName: string;
  @Expose() email: string;
  @Expose() level: number;
  @Expose()
  @Type(() => SessionDto)
  session: SessionDto[];

  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
}
