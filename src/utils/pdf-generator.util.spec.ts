import * as puppeteer from 'puppeteer';
import { PdfGeneratorUtil } from './pdf-generator.util';

jest.mock('puppeteer');

function makeBrowser() {
  const page = {
    setContent: jest.fn().mockResolvedValue(undefined),
    pdf: jest.fn().mockResolvedValue(Buffer.from('%PDF')),
    close: jest.fn().mockResolvedValue(undefined),
  };
  const handlers: Record<string, () => void> = {};
  const browser: any = {
    connected: true,
    newPage: jest.fn().mockResolvedValue(page),
    on: jest.fn((ev: string, cb: () => void) => {
      handlers[ev] = cb;
    }),
    close: jest.fn().mockResolvedValue(undefined),
    _disconnect: () => {
      browser.connected = false;
      handlers['disconnected']?.();
    },
  };
  return { browser, page };
}

describe('PdfGeneratorUtil', () => {
  const launch = puppeteer.launch as jest.Mock;

  beforeEach(() => launch.mockReset());

  it('reuses a single browser across requests (no zombie leak)', async () => {
    const { browser, page } = makeBrowser();
    launch.mockResolvedValue(browser);
    const util = new PdfGeneratorUtil();

    await Promise.all([util.generatePdf('<p>a</p>'), util.generatePdf('<p>b</p>')]);
    await util.generatePdf('<p>c</p>');

    expect(launch).toHaveBeenCalledTimes(1); // one Chromium, not three
    expect(page.close).toHaveBeenCalledTimes(3); // every page closed
    expect(browser.close).not.toHaveBeenCalled(); // browser kept alive
  });

  it('relaunches after Chromium disconnects', async () => {
    const first = makeBrowser();
    const second = makeBrowser();
    launch.mockResolvedValueOnce(first.browser).mockResolvedValueOnce(second.browser);
    const util = new PdfGeneratorUtil();

    await util.generatePdf('<p>a</p>');
    first.browser._disconnect();
    await util.generatePdf('<p>b</p>');

    expect(launch).toHaveBeenCalledTimes(2);
  });
});
