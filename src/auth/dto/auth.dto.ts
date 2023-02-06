type Session = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export class AuthResponse {
  email: string;
  firstName: string;
  lastName: string;
  level: number;
  publicId: string;
  session: Session[];
  constructor(
    email: string,
    firstName: string,
    lastName: string,
    level: number,
    publicId: string,
    session: Session[],
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.level = level;
    this.publicId = publicId;
    this.session = session;
  }
}
