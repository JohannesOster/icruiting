import React, {forwardRef, useEffect, useRef} from 'react';
import {CheckboxProps} from './types';
import {
  Container,
  Label,
  Description,
  Errors,
  OptionContainer,
  OptionLabel,
} from './Checkbox.sc';

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      options,
      errors = [],
      value,
      defaultValue,
      indeterminate,
      ...props
    },
    ref,
  ) => {
    const _errors = errors.map((error, idx) => (
      <span key={idx}>• {error}</span>
    ));

    const id = useRef(Math.random().toString(36).substring(7));

    useEffect(() => {
      const checkbox = document.getElementById(id.current) as HTMLInputElement;
      if (!checkbox) return;
      checkbox.indeterminate = indeterminate;
    }, [indeterminate]);

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
        {options.map(({label, value: optionVal}, index) => {
          const checked = {} as any;
          if (defaultValue?.includes(optionVal)) checked.defaultChecked = true;
          else if (value?.includes(optionVal)) checked.checked = true;
          else if (props.onChange) checked.checked = false; // if is controlled input
          return (
            <OptionContainer key={index}>
              <input
                {...props}
                type="checkbox"
                value={optionVal}
                {...checked}
                ref={ref}
                id={id.current}
              />
              {label && <OptionLabel>{label}</OptionLabel>}
            </OptionContainer>
          );
        })}
        {!!_errors.length && <Errors>{_errors}</Errors>}
      </Container>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export {Checkbox};
