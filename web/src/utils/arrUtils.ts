export const arrMove = (array: any[], from: number, to: number) => {
  if (from < 0 || from >= array.length)
    throw new Error('From index is out of bounce');
  if (to < 0 || to >= array.length)
    throw new Error('To index is out of bounce');

  const tmp = [...array];
  const [item] = tmp.splice(from, 1);
  tmp.splice(to, 0, item);
  return tmp;
};

export const arrInsert = (array: any[], item: any, index: number) => {
  if (index < 0 || index > array.length)
    throw new Error('Index is out of bounce');

  const tmp = [...array];
  tmp.splice(index, 0, item);
  return tmp;
};
