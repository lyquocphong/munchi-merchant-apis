import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthCredentials } from 'src/type';
import { AuthService } from './auth.service';
import { AuthReponseDto } from './dto/auth.dto';
import { RefreshJwt } from './guard/refreshJwt.guard';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Sign in new user',
    type: AuthReponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Please try again',
  })
  @Post('signin')
  async signIn(@Body() credentials: AuthCredentials) {
    return this.authService.signIn(credentials);
  }

  @UseGuards(JwtGuard)
  @Post('updateToken')
  async autoSignIn(@Request() req: any) {
    const { userId } = req.user;
    return this.authService.updateToken(userId);
  }

  @ApiCreatedResponse({
    description: 'Signed out',
  })
  @Post('signout')
  async signOut(@Body('publicUserId') publicUserId: string) {
    return this.authService.signOut(publicUserId);
  }
  @UseGuards(RefreshJwt)
  @Get('refreshToken')
  getRefreshTokens(@Request() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
