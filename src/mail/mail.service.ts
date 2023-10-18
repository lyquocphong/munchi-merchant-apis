import { MailerService } from '@nestjs-modules/mailer';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PdfService } from 'src/pdf/pdf.service';


@Injectable()
export class MailService {
  constructor(
    private  readonly mailerService: MailerService,
    private  readonly pdfService: PdfService
  ) {}
  async sendEmail() {
    const pdfTestBuffer  = await this.pdfService.generatePdf()
    console.log(pdfTestBuffer)
    console.log(typeof pdfTestBuffer)
    try {
      await this.mailerService.sendMail({
        to: 'test@test.com', // list of receivers
        from: 'noreply@test.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content,
        attachments: [{
          filename:'report-test.pdf',
          content: pdfTestBuffer
        }]
      })
    } catch (error) {
      console.log(error)
      throw new ForbiddenException(error,'404')
    }
    
  }
}

// template 
//generate pdf file ,  and attached it 
//send emaail put on sender 
//hard code 