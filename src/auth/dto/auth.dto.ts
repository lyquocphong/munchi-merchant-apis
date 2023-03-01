import { ApiProperty } from '@nestjs/swagger';
import { type } from 'os';

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
  session: Session[];
  verifyToken: string;
  constructor(
    email: string,
    firstName: string,
    lastName: string,
    level: number,
    publicId: string,
    session: Session[],
    verifyToken: string,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.level = level;
    this.publicId = publicId;
    this.session = session;
    this.verifyToken = verifyToken;
  }
}

export class AuthReponseDto {
  @ApiProperty({
    description: 'The id of user',
    example: '12334',
  })
  id: number;
  @ApiProperty({
    description: 'The fistName of user',
    example: 'John',
  })
  firstName: string;
  @ApiProperty({
    description: 'The lastName of user',
    example: 'Doe',
  })
  lastName: string;
  @ApiProperty({
    description: 'The email of user',
    example: 'johndoe@gmail.com',
  })
  email: string;
  @ApiProperty({
    description: 'The level of user',
    example: '2',
  })
  level: number;
  @ApiProperty({
    description: 'The verify token of user',
    example: 'verifyToken',
  })
  verifyToken: string;
  @ApiProperty({
    description: 'The session of user',
    example: {
      accessToken: 'accesssToken',
      tokenType: 'bearer',
      expiresIn: '4000000',
    },
  })
  session: Session;
}
