import React, {forwardRef} from 'react';
import {
  BaseTextarea,
  Label,
  Container,
  Description,
  Errors,
} from './Textarea.sc';
import {TextareaProps} from './types';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({label, description, errors = [], ...props}, ref) => {
    const _errors = errors.map((error, idx) => (
      <span key={idx}>• {error}</span>
    ));

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
        <BaseTextarea error={!!errors.length} ref={ref} {...props} />
        {!!errors.length && <Errors>{_errors}</Errors>}
      </Container>
    );
  },
);

Textarea.displayName = 'Textarea';

export {Textarea};
