import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Delete,
  Req,
  Param,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthCredentials } from 'src/type';
import { AuthService } from './auth.service';
import { AuthReponseDto } from './dto/auth.dto';
import { RefreshJwt } from './guard/refreshJwt.guard';
import { JwtGuard } from './guard/jwt.guard';
import { SessionService } from './session.service';
import { ApiKeyGuard } from './guard/apiKey.guard';

@Controller('auth')
@ApiTags('auth')
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

  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('session')
  /**
   * Has checked
   */
  getSession(@Req() request: any) {
    const page = request.query.page;
    const rowPerPage = request.query.rowPerPage;
    return this.sessionService.getAllUserSession(parseInt(page), parseInt(rowPerPage));
  }

  @UseGuards(ApiKeyGuard)
  @Get('session/:publicUserId')
  /**
   * Has checked
   */
  getUserSessions(@Param('publicUserId') publicUserId: string, @Req() request: any) {
    const page = request.query.page;
    const rowPerPage = request.query.rowPerPage;
    return this.sessionService.getSessionByPublicUserId(
      publicUserId,
      parseInt(page),
      parseInt(rowPerPage),
    );
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete('session')
  /**
   * Has checked
   */
  deleteSession(sessionPublicId: string[]) {
    return this.sessionService.deleteUserSessions(sessionPublicId);
  }
}
