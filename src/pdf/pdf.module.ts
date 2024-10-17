import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { TemplateService } from '../templates/template.service';
import { PdfGeneratorUtil } from '../utils/pdf-generator.util';

@Module({
  controllers: [PdfController],
  providers: [PdfService, TemplateService, PdfGeneratorUtil],
})
export class PdfModule {}
