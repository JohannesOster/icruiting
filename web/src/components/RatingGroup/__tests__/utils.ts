import {isSelected} from '../utils';

describe('isSelected', () => {
  it('selects nothing for an empty value, even the 0 option', () => {
    expect(isSelected('', 0)).toBe(false);
    expect(isSelected(null, 0)).toBe(false);
    expect(isSelected(undefined, 0)).toBe(false);
  });

  it('matches a string value against a numeric option', () => {
    expect(isSelected('0', 0)).toBe(true);
    expect(isSelected('3', 3)).toBe(true);
    expect(isSelected(2, '2')).toBe(true);
  });

  it('does not match a different option', () => {
    expect(isSelected('0', 1)).toBe(false);
    expect(isSelected('1', 0)).toBe(false);
  });
});
