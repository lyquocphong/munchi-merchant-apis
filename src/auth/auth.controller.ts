import { Controller, Post, Body } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { AuthCredentials } from 'src/type';
import { AuthReponseDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private orderingIo: OrderingIoService) {}
  @ApiCreatedResponse({
    description: 'Sign up new user',
    type: AuthReponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Please try again',
  })
  @Post('signup')
  signup(@Body() credentials: AuthCredentials) {
    return this.orderingIo.signUp(credentials);
  }
  @ApiCreatedResponse({
    description: 'Sign in new user',
    type: AuthReponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Please try again',
  })
  @Post('signin')
  signin(@Body() credentials: AuthCredentials) {
    return this.orderingIo.signIn(credentials);
  }
  @ApiCreatedResponse({
    description: 'Signed out',
  })
  @Post('signout')
  signout(@Body('publicUserId') publicUserId: string) {
    return this.orderingIo.signOut(publicUserId);
  }
}
