import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import * as fs from 'fs';
const PDFDocument = require('pdfkit');


@Injectable()
export class PdfService {
    constructor() { }
    async generatePdf() {

        return new Promise<Buffer>((resolve, reject) => {
            // Create a document
            const doc = new PDFDocument();
      
            // Create a buffer to store the PDF content
            const buffers: Buffer[] = [];
      
            // Capture the PDF content in the buffer
            doc.on('data', (buffer: Buffer) => buffers.push(buffer));
      
            // Finalize PDF file
            doc.on('end', () => {
              const pdfBuffer = Buffer.concat(buffers);
              resolve(pdfBuffer);
            });
      
            // Add some content to the PDF
            doc.fontSize(16).text('Hello, this is a sample PDF!', 50, 50);
            doc.text('You can add more text, images, and other elements as needed.');
      
            // Finalize PDF file
            doc.end();
          });
        }
    
    
    async deletePdfFile() {

    }
}

// template 
//generate pdf file ,  and attached it 
//send emaail put on sender 
//hard code 