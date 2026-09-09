import React, {forwardRef} from 'react';
import {BaseInput, Label, Container, Description, Errors} from './Input.sc';
import {InputProps} from './types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({label, description, errors = [], ...props}, ref) => {
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
        <BaseInput id={props.name} error={!!errors.length} ref={ref} {...props} />
        {!!errors.length && <Errors>{_errors}</Errors>}{' '}
      </Container>
    );
  },
);

Input.displayName = 'Input';

export {Input};
