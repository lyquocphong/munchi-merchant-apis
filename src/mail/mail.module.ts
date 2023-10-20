import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PdfModule } from 'src/pdf/pdf.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to use environment variables
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_SERVICE'),
          secure: false,
          port: 587,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        template: {
          dir: join(__dirname, 'mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    PdfModule
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule { }
