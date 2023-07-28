import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthCredentials {
  @ApiProperty({
    description: 'Input email provided',
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Input password provided',
    type: 'password',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Device id which will be used to work with Onesignal',    
    example: '123123-sadsad2-213214',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
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

export type AuthTokens = {
  verifyToken: string;
  refreshToken: string;
};
