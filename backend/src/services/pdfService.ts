import puppeteer, { Browser } from 'puppeteer';
import { ResumeData } from '@resume-app/shared';
import { renderTemplate } from '../templates';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new' as unknown as boolean,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function generatePdf(data: ResumeData): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    const html = renderTemplate(data, data.selectedTemplate);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
