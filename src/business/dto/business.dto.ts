/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OwnerDto } from './owner.dto';
import { Schedule } from 'src/ordering.io/ordering.io.type';
import { IsBoolean, IsString } from 'class-validator';

@Exclude()
export class BusinessDto {
  @ApiProperty({
    description: 'The id of business',
    example: '123456',
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'The name of business',
    example: 'Juicy Burger',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'The email of business',
    example: 'juicyburger@munchi.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'The id of business',
    example: 'Helsinkikatu 100C, Helsinki, Finland',
  })
  @Expose()
  address: string;

  @ApiProperty({
    description: 'The logo of business',
    example: 'logo url',
  })
  @Expose()
  logo: string;

  @ApiProperty({
    description: 'The address of business',
    example: true,
  })
  @Expose()
  enabled: boolean;

  @ApiProperty({
    description: 'Schedule for today',
    example: {
      "enabled": true,
      "lapses": [
        {
          "open": {
            "hour": 0,
            "minute": 0
          },
          "close": {
            "hour": 23,
            "minute": 30
          }
        }
      ]
    },
  })
  @Expose()
  today: Schedule;

  @ApiProperty({
    description: 'The owners of business',
    example: {
      id: '123456',
      name: 'John doe',
      lastName: 'John',
      email: 'johndoe@gmail.com',
      level: 2,
    },
  })
  @Expose()
  @Type(() => OwnerDto)
  owners: OwnerDto[];
  constructor(partial: Partial<OwnerDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class AllBusinessDto {
  // @Expose() id: number;
  @ApiProperty({
    description: 'The id of business',
    example: '123456',
  })
  @Expose({ name: 'id' })
  businessId: string;
  @ApiProperty({
    description: 'The name of business',
    example: 'Juicy Burger',
  })
  @Expose()
  name: string;
  // @Expose() timezone: string;
  constructor(partial: Partial<AllBusinessDto>) {
    Object.assign(this, partial);
  }
}

export class SetOnlineStatusDto {
  @ApiProperty({
    description: 'The public id of business',
    example: '123456',
  })
  @IsString()
  publicBusinessId: string;
  
  @ApiProperty({
    description: 'Status want to set. true for on and false for off',
    example: false,
  })
  @IsBoolean()
  status: boolean;
}