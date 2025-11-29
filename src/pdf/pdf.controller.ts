import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { PdfRequestDto } from './dto/pdf-request.dto';

@ApiTags('PDF Generation')
@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a PDF document' })
  @ApiBody({ type: PdfRequestDto })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePdf(@Body() pdfRequestDto: PdfRequestDto, @Res() res: Response) {
    try {
      this.logger.log(`Generating PDF for country: ${pdfRequestDto.country}`);
      
      const pdfBuffer = await this.pdfService.generatePdf(pdfRequestDto);
      
      // Sanitizar el nombre para el archivo: usar solo el primer nombre y remover caracteres inválidos
      const firstName = pdfRequestDto.name.split('\n')[0].trim();
      const sanitizedName = firstName.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = `${pdfRequestDto.country}_${sanitizedName}_${Date.now()}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });

      this.logger.log(`PDF generated successfully: ${fileName}`);
      return res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF: ${error.message}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while generating the PDF',
        error: error.message,
      });
    }
  }
}