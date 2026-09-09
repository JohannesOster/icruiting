import React, {FC, ChangeEvent, KeyboardEvent, useState} from 'react';
import {
  BaseChipInput,
  Label,
  Container,
  Description,
  Errors,
  ChipContainer,
  Chip,
  ChipCloseBtn,
} from './ChipInput.sc';
import {ChipInputProps} from './types';

export const ChipInput: FC<ChipInputProps> = ({
  label,
  description,
  errors = [],
  onChange,
  value,
  defaultValue,
  confirmKey = 'Tab',
  ...props
}) => {
  const [chips, setChips] = useState<string[]>(value || defaultValue || []);
  const [_value, setValue] = useState('');

  const removeChip = (index: number) => {
    const newVal = chips.filter((_chip, idx) => idx !== index);
    setChips(newVal);
    onChange && onChange(newVal);
  };

  const _onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const _onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === confirmKey) {
      if (!_value) return;
      event.preventDefault();
      const newVal = chips.concat(_value);
      onChange && onChange(newVal);
      setChips(newVal);
      setValue('');
    } else if (event.key === 'Backspace') {
      if (_value || !chips.length) return;
      removeChip(chips.length - 1);
    }
  };

  const _errors = errors.map((error, idx) => <span key={idx}>• {error}</span>);

  return (
    <Container>
      {label && (
        <Label htmlFor={props.name} error={!!errors.length}>
          {label}
          {props.required && '*'}
        </Label>
      )}
      {description && (
        <Description error={!!errors.length}>{description}</Description>
      )}
      <ChipContainer error={!!errors.length}>
        {chips.map((chip, idx) => (
          <Chip key={idx}>
            {chip}
            <ChipCloseBtn onClick={() => !props.readOnly && removeChip(idx)}>
              X
            </ChipCloseBtn>
          </Chip>
        ))}

        <BaseChipInput
          value={_value}
          onChange={_onChange}
          onKeyDown={_onKeyDown}
          error={!!errors.length}
          {...props}
        />
      </ChipContainer>
      {!!errors.length && <Errors>{_errors}</Errors>}
    </Container>
  );
};
