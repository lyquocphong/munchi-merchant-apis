import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    Sentry.captureException(exception);

    if (exception.message) {
      Sentry.captureMessage(exception.message);
    }
    super.catch(exception, host);
  }
}
