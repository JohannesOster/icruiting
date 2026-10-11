import puppeteer, {Browser, Page} from 'puppeteer';

type LaunchBrowser = () => Promise<Browser>;

const launchChrome: LaunchBrowser = () =>
  puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

/**
 * Shares one Chrome between PDF renders. Renders are capped at `maxConcurrentRenders` and the rest
 * queue: every open tab costs memory, and a bulk download of ~18 reports at once got Chrome killed
 * on the 512 MB Heroku dyno.
 */
export class BrowserManager {
  private browser: Promise<Browser> | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private activeRenders = 0;
  private waiting: Array<() => void> = [];

  constructor(
    private idleTimeoutMs: number = 30000,
    private maxConcurrentRenders: number = 2,
    private launch: LaunchBrowser = launchChrome,
  ) {}

  private getBrowser(): Promise<Browser> {
    if (!this.browser) {
      const browser = this.launch().then(
        (instance) => {
          // a crashed Chrome must not serve the next request
          instance.once('disconnected', () => {
            if (this.browser === browser) this.browser = null;
          });
          return instance;
        },
        (err) => {
          if (this.browser === browser) this.browser = null;
          throw err;
        },
      );
      this.browser = browser;
    }
    return this.browser;
  }

  private async acquireSlot(): Promise<void> {
    if (this.activeRenders < this.maxConcurrentRenders) {
      this.activeRenders++;
    } else {
      // the releasing render hands its slot over, so activeRenders stays as it is
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.clearIdleTimer();
  }

  private releaseSlot(): void {
    const next = this.waiting.shift();
    if (next) return next();
    this.activeRenders--;
    if (this.activeRenders === 0) {
      this.idleTimer = setTimeout(() => this.closeBrowser(), this.idleTimeoutMs);
    }
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private async closeBrowser(): Promise<void> {
    const browser = this.browser;
    // detach first, so a request arriving during close() launches a fresh browser
    this.browser = null;
    if (!browser) return;
    try {
      await (await browser).close();
    } catch {
      // already crashed or never launched — nothing left to close
    }
  }

  async renderPDF(html: string, options: any): Promise<Buffer> {
    await this.acquireSlot();
    try {
      const browser = await this.getBrowser();
      const page: Page = await browser.newPage();
      try {
        await page.setContent(html, {waitUntil: 'networkidle0'});
        const pdf = await page.pdf(options);
        return Buffer.from(pdf);
      } finally {
        await page.close().catch(() => {});
      }
    } finally {
      this.releaseSlot();
    }
  }
}
