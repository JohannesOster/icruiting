import {EventEmitter} from 'events';
import {Browser} from 'puppeteer';
import {BrowserManager} from './browserManager';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class FakeBrowser extends EventEmitter {
  inFlight = 0;
  maxInFlight = 0;
  closed = false;
  renderMs = 10;
  failNextRender = false;

  async newPage() {
    if (this.closed) throw new Error('Protocol error (Target.createTarget): Target closed');
    return {
      setContent: async () => {
        this.inFlight++;
        this.maxInFlight = Math.max(this.maxInFlight, this.inFlight);
        await sleep(this.renderMs);
        this.inFlight--;
        if (this.failNextRender) {
          this.failNextRender = false;
          throw new Error('Timed out after waiting 30000ms');
        }
      },
      pdf: async () => new Uint8Array([1]),
      close: async () => {},
    };
  }

  // Chrome dying looks the same to puppeteer as close(): the connection drops
  async close() {
    this.closed = true;
    this.emit('disconnected');
  }
}

const setup = (opts: {idleTimeoutMs?: number; maxConcurrentRenders?: number} = {}) => {
  const browsers: FakeBrowser[] = [];
  const launch = jest.fn(async () => {
    const browser = new FakeBrowser();
    browsers.push(browser);
    return browser as unknown as Browser;
  });
  const manager = new BrowserManager(
    opts.idleTimeoutMs ?? 1000,
    opts.maxConcurrentRenders ?? 2,
    launch,
  );
  return {manager, launch, browsers};
};

describe('BrowserManager', () => {
  it('renders at most maxConcurrentRenders pages at once and queues the rest', async () => {
    const {manager, browsers} = setup({maxConcurrentRenders: 2});

    const results = await Promise.allSettled(
      Array.from({length: 6}, () => manager.renderPDF('<p></p>', {})),
    );

    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(browsers).toHaveLength(1);
    expect(browsers[0].maxInFlight).toBe(2);
  });

  it('frees the slot when a render fails', async () => {
    const {manager, browsers} = setup({maxConcurrentRenders: 1});
    await manager.renderPDF('<p></p>', {});
    browsers[0].failNextRender = true;

    await expect(manager.renderPDF('<p></p>', {})).rejects.toThrow('Timed out');
    await expect(manager.renderPDF('<p></p>', {})).resolves.toBeInstanceOf(Buffer);
  });

  it('launches a new browser right after the old one crashed', async () => {
    const {manager, launch, browsers} = setup();
    await manager.renderPDF('<p></p>', {});

    await browsers[0].close(); // Chrome OOM-killed

    await expect(manager.renderPDF('<p></p>', {})).resolves.toBeInstanceOf(Buffer);
    expect(launch).toHaveBeenCalledTimes(2);
  });

  it('retries the launch after a failed launch', async () => {
    const {manager, launch} = setup();
    launch.mockRejectedValueOnce(new Error('Failed to launch the browser process'));

    await expect(manager.renderPDF('<p></p>', {})).rejects.toThrow('Failed to launch');
    await expect(manager.renderPDF('<p></p>', {})).resolves.toBeInstanceOf(Buffer);
    expect(launch).toHaveBeenCalledTimes(2);
  });

  it('does not close the browser while a render outlasts the idle timeout', async () => {
    const {manager, browsers} = setup({idleTimeoutMs: 20});
    await manager.renderPDF('<p></p>', {});
    browsers[0].renderMs = 60;

    await expect(manager.renderPDF('<p></p>', {})).resolves.toBeInstanceOf(Buffer);
    expect(browsers[0].closed).toBe(false);
  });

  it('closes the browser once idle and launches a fresh one for the next render', async () => {
    const {manager, launch, browsers} = setup({idleTimeoutMs: 20});
    await manager.renderPDF('<p></p>', {});

    await sleep(40);
    expect(browsers[0].closed).toBe(true);

    await expect(manager.renderPDF('<p></p>', {})).resolves.toBeInstanceOf(Buffer);
    expect(launch).toHaveBeenCalledTimes(2);
  });
});
