import { Controller, Post, Body } from '@nestjs/common';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { AuthCredentials } from 'src/type';


@Controller('auth')
export class AuthController {
  constructor( private orderingIo: OrderingIoService) {}

  @Post('signup')
  signup(@Body() credentials: AuthCredentials) {
    return this.orderingIo.signUp(credentials);
  }

  @Post('signin')
  signin(@Body() credentials: AuthCredentials) {
    return this.orderingIo.signIn(credentials);
  }

   @Post('signout')
  signout(@Body('publicUserId') publicUserId: string) {
    return this.orderingIo.signOut(publicUserId);
  }
}
