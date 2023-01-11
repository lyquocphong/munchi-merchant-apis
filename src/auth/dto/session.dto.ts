import { Exclude } from 'class-transformer';

@Exclude()
export class SessionDto {
  accessToken: string;
  tokenType: string;
  expiresIn: string;

  constructor(partial: Partial<SessionDto>) {
    Object.assign(this, partial);
  }
}
