import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AuthCredentials {
  name: string;
  lastname: string;
  role: string | number;
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export type OrderId = string;

export type FilterQuery = {
  businessId: number,
  status: number
}

export interface OrderData {
  prepaired_in: string;
  orderStatus: string;
}
