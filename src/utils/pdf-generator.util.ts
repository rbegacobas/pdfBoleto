import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfGeneratorUtil {
  private readonly logger = new Logger(PdfGeneratorUtil.name);

  async generatePdf(html: string): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;
    try {
      // Usar variable de entorno o ruta por defecto
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';

      browser = await puppeteer.launch({
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({ format: 'A4' });
      return Buffer.from(pdf);
    } catch (error) {
      this.logger.error('Error generating PDF', error.stack);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
