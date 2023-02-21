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
  status: number | number[];
};

export interface OrderData {
  preparedIn: number;
  orderStatus: string;
}

export type BusinessAttributes = {
  name: string;
  email: string;
  slug: string;
  city_id: number;
  enabled: boolean;
};
