import React, {forwardRef} from 'react';
import {Container, Label, Description, Errors, BaseSelect} from './Select.sc';
import {SelectProps} from './types';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({label, description, options, errors = [], ...props}, ref) => {
    const _errors = errors.map((error, idx) => <span key={idx}>• {error}</span>);

    return (
      <Container>
        {label && (
          <Label htmlFor={props.name} error={!!errors.length}>
            {label}
            {props.required && '*'}
          </Label>
        )}
        {description && <Description error={!!errors.length}>{description}</Description>}
        <BaseSelect {...props} ref={ref}>
          {options.map(({label, value}, idx) => {
            return (
              <option key={idx} value={value}>
                {label}
              </option>
            );
          })}
        </BaseSelect>
        {!!errors.length && <Errors>{_errors}</Errors>}
      </Container>
    );
  },
);

Select.displayName = 'Select';

export {Select};
