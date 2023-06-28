import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SessionDto {
  @Expose({ name: 'access_token' })
  accessToken: string;
  @Expose({ name: 'token_type' })
  tokenType: string;
  @Expose({ name: 'expires_in' })
  expiresAt: string;

  constructor(partial: Partial<SessionDto>) {
    Object.assign(this, partial);
  }
}
