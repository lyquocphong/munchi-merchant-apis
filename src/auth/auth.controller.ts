import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OrderingIoService } from 'src/ordering.io/ordering.io.service';
import { AuthCredentials } from 'src/type';
import { AuthService } from './auth.service';
import { AuthReponseDto } from './dto/auth.dto';
import { RefreshJwt } from './guard/refreshJwt.guard';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private orderingIo: OrderingIoService, private auth: AuthService) {}

  @ApiCreatedResponse({
    description: 'Sign in new user',
    type: AuthReponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Please try again',
  })
  @Post('signin')
  async signIn(@Body() credentials: AuthCredentials) {
    return this.auth.signIn(credentials);
  }

  @UseGuards(JwtGuard)
  @Post('updateToken')
  async autoSignIn(@Request() req: any) {
    const {userId} = req.user
    return this.auth.updateToken(userId);
  }

  @ApiCreatedResponse({
    description: 'Signed out',
  })
  @Post('signout')
  async signOut(@Body('publicUserId') publicUserId: string) {
    await this.auth.signOut(publicUserId);
    return this.orderingIo.signOut(publicUserId);
  }
  @UseGuards(RefreshJwt)
  @Get('refreshToken')
  getRefreshTokens(@Request() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.auth.refreshTokens(userId, refreshToken);
  }
}
