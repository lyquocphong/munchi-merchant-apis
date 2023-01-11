import { Exclude } from 'class-transformer';

@Exclude()
export class AuthDto {
name:string;
  email: string;
  password: string;


  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
}
