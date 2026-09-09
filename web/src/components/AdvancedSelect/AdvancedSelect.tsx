import React, {forwardRef, useState} from 'react';
import {SelectProps} from './types';
import {useTheme} from 'styled-components';
import {Box} from 'components/Box';
import {SelectSymbol} from 'icons';
import {Container, ConentContainer, Label, Select} from './AdvancedSelect.sc';

const AdvancedSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({label, description, options, icon, errors = [], onChange, ...props}, ref) => {
    const {spacing} = useTheme();

    const [_value, _setValue] = useState(props.value || '');

    const _onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (props.value === undefined) _setValue(e.target.value);
      onChange?.(e);
    };

    const getSelectedOption = (options: Array<{label: string; value: string}>, value: string) => {
      let selectedOption = options.find((option) => value === option.value);
      if (selectedOption === undefined) selectedOption = options[0];
      return selectedOption || {value: '', label: ''};
    };

    return (
      <Container>
        <Select {...props} onChange={_onChange} ref={ref}>
          {options.map(({label, value}, idx) => (
            <option key={idx} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <ConentContainer>
          <Box display="flex" gap={spacing.scale200}>
            {(icon || label) && (
              <Label>
                {icon} {label}
              </Label>
            )}
            <span style={{whiteSpace: 'nowrap'}}>{getSelectedOption(options, _value).label}</span>
          </Box>
          <SelectSymbol />
        </ConentContainer>
      </Container>
    );
  },
);

AdvancedSelect.displayName = 'AdvancedSelect';

export {AdvancedSelect};
