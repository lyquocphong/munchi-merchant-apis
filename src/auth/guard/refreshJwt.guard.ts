import { AuthGuard } from '@nestjs/passport';

export class RefreshJwt extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
