import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { PdfService } from 'src/pdf/pdf.service';
import { MailProps } from './mail.type';
import { SendMailOptions } from 'nodemailer';
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly pdfService: PdfService,
    private readonly configService: ConfigService
  ) { }
  async sendEmail({ sender,to: recipient,context: data }: ISendMailOptions) {
    //sender , recipient
    const pdfBuffer = await this.pdfService.generatePdf()
    const heroImgPath = 'mail/templates/img/hero.png';
    const templatePath = './weekly-report'
    try {
      await this.mailerService.sendMail({
        to: recipient, // list of receivers
        from: sender, // sender address
        subject: 'Juicy burger weekly report', // Subject line
        template: templatePath, //template path
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
            filename: 'report.pdf',
            content: pdfBuffer
          }]
      })
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }

  }

  async sendWeeklyEmail ({from,to, context}: ISendMailOptions) {
    this.sendEmail({sender: from,  to: to, context:context})
  }
}

// template 
//generate pdf file ,  and attached it 
//send emaail put on sender 
//hard code 