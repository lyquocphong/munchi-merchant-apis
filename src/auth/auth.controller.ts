import { Controller, Post, Body } from '@nestjs/common';
import { AuthCredentials } from 'src/type';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() credentials: AuthCredentials) {
    console.log(credentials);
    return this.authService.signup(credentials);
  }

  @Post('signin')
  signin(@Body() credentials: AuthCredentials) {
    return this.authService.signin(credentials);
  }
}
