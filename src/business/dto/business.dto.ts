/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OwnerDto } from './owner.dto';

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
