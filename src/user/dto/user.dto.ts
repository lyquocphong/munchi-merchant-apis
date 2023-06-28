import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { AddressDto } from './address.dto';

@Exclude()
export class UserDto {
  @ApiProperty({
    description: 'The id of user',
    example: '123456',
  })
  @Expose()
  id: number;
  @ApiProperty({
    description: 'The name of user',
    example: '123456',
  })
  @Expose()
  name: string;
  @ApiProperty({
    description: 'The lastname of user',
    example: 'John',
  })
  @Expose()
  lastname: string;
  @ApiProperty({
    description: 'The email of business',
    example: 'johndoe@gmail.com',
  })
  @Expose()
  email: string;
  @ApiProperty({
    description: 'The level of user',
    example: '',
  })
  @Expose()
  level: number;
  @ApiProperty({
    description: 'The address of user',
    example: {
      id: '12345',
      address: 'Wonderlandtie 69C Finland',
    },
  })
  @Expose()
  @Type(() => AddressDto)
  addresses: AddressDto[];

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
