import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthCredentials } from 'src/type';
import { AuthService } from './auth.service';
import { AuthReponseDto } from './dto/auth.dto';
import { RefreshJwt } from './guard/refreshJwt.guard';
import { JwtGuard } from './guard/jwt.guard';
import { SessionService } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private sessionService: SessionService) { }

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

  @ApiCreatedResponse({
    description: 'Signed out',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post('signout')
  /**
   * Has checked
   */
  async signOut(@Request() req: any) {    
    const { sessionPublicId } = req.user;
    return this.authService.signOut(sessionPublicId);
  }

  @UseGuards(RefreshJwt)
  @ApiBearerAuth('JWT-auth')
  @Get('refreshToken')
  /**
   * Has checked
   */
  getRefreshTokens(@Request() req: any) {
    const { refreshToken, sessionPublicId } = req.user;
    return this.sessionService.refreshTokens(refreshToken, sessionPublicId);
  }
}
