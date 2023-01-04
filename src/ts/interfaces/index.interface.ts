import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AuthCredentials {
 
  name: string;
  lastname: string;
  role: string | number
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export interface OrderId {
  orderId: string;
}
