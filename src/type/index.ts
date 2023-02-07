import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthCredentials {
  firstName?: string;
  lastname?: string;
  role?: string | number;
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export type OrderId = number;

export type FilterQuery = {
  businessId: number;
  status: number;
};

export interface OrderData {
  prepared_in: number;
  orderStatus: string;
}

export type UserData = {
  email,
 firstName:string,
  lastName:string,
  level:number,
publicId:string,
 session,
};