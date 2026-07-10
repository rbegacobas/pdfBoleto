import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfGeneratorUtil implements OnModuleDestroy {
  private readonly logger = new Logger(PdfGeneratorUtil.name);
  private browser: puppeteer.Browser | null = null;
  private launching: Promise<puppeteer.Browser> | null = null;

  /**
   * Returns a shared, live browser instance, launching it once and reusing it.
   * Reusing one browser (instead of launch-per-request) avoids the per-request
   * ~30s launch timeout and the Chromium/crashpad zombie leak that caused the
   * host to saturate. The `launching` promise serializes concurrent callers so
   * a burst of requests never spawns several Chromium processes at once.
   */
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (this.browser?.connected) {
      return this.browser;
    }
    if (this.launching) {
      return this.launching;
    }

    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';

    this.launching = puppeteer
      .launch({
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      .then((browser) => {
        this.browser = browser;
        // If Chromium dies, drop the reference so the next call relaunches.
        browser.on('disconnected', () => {
          this.browser = null;
        });
        this.logger.log('Chromium launched (shared instance)');
        return browser;
      })
      .finally(() => {
        this.launching = null;
      });

    return this.launching;
  }

  async generatePdf(html: string): Promise<Buffer> {
    let page: puppeteer.Page | null = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4' });
      return Buffer.from(pdf);
    } catch (error) {
      this.logger.error('Error generating PDF', error.stack);
      throw new Error('Failed to generate PDF');
    } finally {
      // Close only the page; the browser stays alive for reuse.
      if (page) {
        await page.close().catch(() => undefined);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => undefined);
      this.browser = null;
    }
  }
}
