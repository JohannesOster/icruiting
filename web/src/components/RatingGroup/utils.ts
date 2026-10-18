type OptionValue = string | number | null | undefined;

/**
 * Whether `selected` (a default or current value) picks the option `optionValue`.
 * Compared as strings so '2' matches 2, but an empty value picks nothing: a loose
 * `'' == 0` would pre-check the 0 option of every field without a default.
 */
export const isSelected = (selected: OptionValue, optionValue: OptionValue) => {
  if (selected === undefined || selected === null || selected === '') return false;
  return String(selected) === String(optionValue);
};
