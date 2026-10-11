import {settleWithConcurrency} from '../settleWithConcurrency';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('settleWithConcurrency', () => {
  it('runs at most `limit` tasks at once', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const task = async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await sleep(5);
      inFlight--;
    };

    await settleWithConcurrency([1, 2, 3, 4, 5], 2, task);

    expect(maxInFlight).toBe(2);
  });

  it('keeps going after a failure and reports results in input order', async () => {
    const results = await settleWithConcurrency(['a', 'b', 'c'], 2, async (item) => {
      if (item === 'b') throw new Error('500');
      await sleep(item === 'a' ? 10 : 1);
      return item.toUpperCase();
    });

    expect(results.map((r) => r.status)).toStrictEqual(['fulfilled', 'rejected', 'fulfilled']);
    expect(results[0]).toStrictEqual({status: 'fulfilled', value: 'A'});
  });

  it('resolves to an empty list for no items', async () => {
    expect(await settleWithConcurrency([], 2, async () => 1)).toStrictEqual([]);
  });
});
