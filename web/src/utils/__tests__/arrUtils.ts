import {arrInsert, arrMove} from '../../arrUtils';

describe('arrMove', () => {
  it('returns mutatedArray', () => {
    const array = [1, 2, 3, 4];
    const expected = [2, 1, 3, 4];

    expect(arrMove(array, 0, 1)).toStrictEqual(expected);
  });

  it('does not modify passed array', () => {
    const array = [1, 2, 3, 4];
    const expected = [1, 2, 3, 4];
    arrMove(array, 0, 1);

    expect(array).toStrictEqual(expected);
  });

  it('throws error if index is out of bounds', () => {
    const array = [1, 2, 3, 4];
    const invalidToIdx = () => arrMove(array, 0, array.length);
    const invalidFromIdx = () => arrMove(array, -1, 2);

    expect(invalidToIdx).toThrow('To index is out of bounce');
    expect(invalidFromIdx).toThrow('From index is out of bounce');
  });
});

describe('arrInsert', () => {
  it('returns mutatedArray', () => {
    const array = [1, 2, 4];
    const item = 3;
    const expected = [1, 2, 3, 4];

    expect(arrInsert(array, item, 2)).toStrictEqual(expected);
  });

  it('does not modify passed array', () => {
    const array = [1, 2, 4];
    const item = 3;
    const expected = [1, 2, 4];

    arrInsert(array, item, 2);

    expect(array).toStrictEqual(expected);
  });

  it('throws error if index is out of bounds', () => {
    const array = [1, 2, 4];
    const item = 3;
    const negativeIdx = () => arrInsert(array, item, -1);
    const toLargeIdx = () => arrInsert(array, item, array.length + 1);

    expect(negativeIdx).toThrow('Index is out of bounce');
    expect(toLargeIdx).toThrow('Index is out of bounce');
  });

  it('inserts item at the end', () => {
    const array = [1, 2, 4];
    const item = 5;
    expect(arrInsert(array, item, array.length)).toStrictEqual([1, 2, 4, 5]);
  });
});
