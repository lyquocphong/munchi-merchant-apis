import { MailerService } from '@nestjs-modules/mailer';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { PdfService } from 'src/pdf/pdf.service';
import { MailProps } from './mail.type';
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly pdfService: PdfService,
    private readonly configService: ConfigService
  ) { }
  async sendEmail({ from = this.configService.get('DEFAULT_SENDER'), recipient,data }: MailProps) {

    const pdfBuffer = await this.pdfService.generatePdf()
    const heroImgPath = 'mail/templates/img/hero.png';

    try {
      await this.mailerService.sendMail({
        to: recipient, // list of receivers
        from: from, // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body,
        template: './weekly-report',
        context: {
          orders: data.orderTotal,
          revenue: data.subTotal,
          reviews: 1000,
          avgRating: 4.9
        },
        attachments: [
          {
            path: path.join(__dirname, heroImgPath), // Use the correct path
            cid: 'hero-image', // Assign a unique CID to the image
            filename: 'hero.png',

          },
          {
            filename: 'report-test.pdf',
            content: pdfBuffer
          }]
      })
    } catch (error) {
      console.log(error)
      throw new ForbiddenException(error, '500')
    }

  }
}

// template 
//generate pdf file ,  and attached it 
//send emaail put on sender 
//hard code 