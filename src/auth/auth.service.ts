import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthCredentials } from 'src/ts';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(credentials: AuthCredentials) {
    const hash = await argon.hash(
      credentials.password,
    );
    try {
      const company =
        await this.prisma.company.create({
          data: {
            email: credentials.email,
            hash,
          },
        });
      delete company.hash;

      return company;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credential is taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(credentials: AuthCredentials) {
    const company =
      await this.prisma.company.findUnique({
        where: {
          email: credentials.email,
        },
      });

    if (!company)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    const pwdCheck = await argon.verify(
      company.hash,
      credentials.password,
    );
    if (!pwdCheck)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    delete company.hash;
    return company;
  }
}
