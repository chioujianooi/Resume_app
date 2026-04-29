import puppeteer, { Browser } from 'puppeteer';
import { ResumeData, CoverLetterData } from '@resume-app/shared';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

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
    await page.setViewport({ width: 794, height: 1123 });
    await page.goto(`${FRONTEND_URL}/resume/${data.id}/print`, {
      waitUntil: 'networkidle0',
    });
    await page.waitForFunction(
      'document.body.dataset.renderDone === "true"',
      { timeout: 10000 }
    );
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    return Buffer.from(pdf);
  } catch (err) {
    // Browser may have crashed — discard the instance so next request gets a fresh one.
    browser = null;
    throw err;
  } finally {
    // page.close() throws if the browser already crashed; swallow it.
    await page.close().catch(() => {});
  }
}

export async function generateCoverLetterPdf(data: CoverLetterData): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setViewport({ width: 794, height: 1123 });
    await page.goto(`${FRONTEND_URL}/cover-letter/${data.id}/print`, {
      waitUntil: 'networkidle0',
    });
    await page.waitForFunction(
      'document.body.dataset.renderDone === "true"',
      { timeout: 10000 }
    );
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    return Buffer.from(pdf);
  } catch (err) {
    browser = null;
    throw err;
  } finally {
    await page.close().catch(() => {});
  }
}
