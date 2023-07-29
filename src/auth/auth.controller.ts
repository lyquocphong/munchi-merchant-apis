import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthCredentials } from 'src/type';
import { AuthService } from './auth.service';
import { AuthReponseDto } from './dto/auth.dto';
import { RefreshJwt } from './guard/refreshJwt.guard';
import { JwtGuard } from './guard/jwt.guard';
import { SessionService } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private sessionService: SessionService) {}

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

  // TODO: Verify does it use in frontend, remove if it not needed after check
  @UseGuards(JwtGuard)
  @Post('updateToken')
  async autoSignIn(@Request() req: any) {
    const { userId, deviceId } = req.user;
    return this.sessionService.updateToken(userId, deviceId);
  }

  @ApiCreatedResponse({
    description: 'Signed out',
  })
  @UseGuards(JwtGuard)
  @Post('signout')
  async signOut(@Request() req: any) {
    const { userId } = req.user;
    return this.authService.signOut(userId);
  }
  @UseGuards(RefreshJwt)
  @Get('refreshToken')
  getRefreshTokens(@Request() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.sessionService.refreshTokens(userId, refreshToken);
  }
}
