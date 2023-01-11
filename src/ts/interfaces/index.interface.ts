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

export type OrderId = string;

export interface OrderData {
  prepaired_in: string;
  order_status: string;
}

export interface BusinessId {
  businessId: string
}

export interface BusinessStatus extends BusinessId {
  business_status: boolean
}