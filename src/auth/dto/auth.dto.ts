import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SessionDto } from './session.dto';

export class UserResponse {
  constructor(
    public email: string,
    public firstName: string,
    public lastName: string,
    public level: number,
    public publicId: string,
    public verifyToken: string,
    public refreshToken: string,
    public sessionId: string
  ) {}
}

export class AuthReponseDto {
  @ApiProperty({
    description: 'The id of user',
    example: '12334',
  })
  @Expose()
  id: number;
  @ApiProperty({
    description: 'The fistName of user',
    example: 'John',
  })
  @Expose()
  firstName: string;
  @ApiProperty({
    description: 'The lastName of user',
    example: 'Doe',
  })
  @Expose()
  lastName: string;
  @ApiProperty({
    description: 'The email of user',
    example: 'johndoe@gmail.com',
  })
  @Expose()
  email: string;
  @ApiProperty({
    description: 'The level of user',
    example: '2',
  })
  @Expose()
  level: number;
  @ApiProperty({
    description: 'The verify token of user',
    example: 'verifyToken',
  })
  @Expose()
  verifyToken: string;
  @ApiProperty({
    description: 'The refresh token',
    example: 'refreshToken',
  })
  @Expose()
  refreshToken: string;
  @ApiProperty({
    description: 'The session of user',
    example: {
      accessToken: 'accesssToken',
      tokenType: 'bearer',
      expiresIn: '4000000',
    },
  })
  @Expose()
  @Type(() => SessionDto)
  session: SessionDto[];
}
