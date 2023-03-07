import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { type } from 'os';
import { SessionDto } from './session.dto';

type Session = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export class UserResponse {
  email: string;
  firstName: string;
  lastName: string;
  level: number;
  publicId: string;
  session: Session;
  verifyToken: string;
  refreshToken: string;
  constructor(
    email: string,
    firstName: string,
    lastName: string,
    level: number,
    publicId: string,
    session: Session,
    verifyToken: string,
    refreshToken: string,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.level = level;
    this.publicId = publicId;
    this.session = session;
    this.verifyToken = verifyToken;
    this.refreshToken = refreshToken;
  }
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
    description: 'The session of user',
    example: {
      accessToken: 'accesssToken',
      tokenType: 'bearer',
      expiresIn: '4000000',
    },
  })
  @Expose()
  refreshToken: string;
  @ApiProperty({
    description: 'The refresh token',
    example: {
      refreshToken: 'refreshToken',
    },
  })
  @Expose()
  @Type(() => SessionDto)
  session: SessionDto[];
}
