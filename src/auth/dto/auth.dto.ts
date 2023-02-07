type Session = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export class UserResponse {
  email: string;
  firstName: string;
  lastName: string;
  level: number;
  publicId: string;
  session: Session[];
  verifyToken: string;
  constructor(
    email: string,
    firstName: string,
    lastName: string,
    level: number,
    publicId: string,
    session: Session[],
    verifyToken: string,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.level = level;
    this.publicId = publicId;
    this.session = session;
    this.verifyToken = verifyToken
  }
}
