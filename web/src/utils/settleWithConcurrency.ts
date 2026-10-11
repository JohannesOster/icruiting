/** Like Promise.allSettled over `items.map(task)`, but with at most `limit` tasks running at once. */
export const settleWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> => {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = {status: 'fulfilled', value: await task(items[index])};
      } catch (reason) {
        results[index] = {status: 'rejected', reason};
      }
    }
  };
  await Promise.all(Array.from({length: Math.min(limit, items.length)}, worker));
  return results;
};
