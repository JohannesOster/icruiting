import React, {forwardRef} from 'react';
import {Radio, RadioLabel, StyledRatingGroup} from './RatingGroup.sc';
import {Box, Typography} from 'components';
import {useTheme} from 'styled-components';

type Props = {
  name: string;
  label: string;
  description?: string;
  options: {label: string; value: string}[];
  value?: string;
  defaultValue?: string;
  required: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const RatingGroup = forwardRef<HTMLInputElement, Props>(
  (
    {name, label, description, options = [], value, defaultValue, ...props},
    ref,
  ) => {
    const {spacing} = useTheme();
    return (
      <Box display="grid" rowGap={spacing.scale200}>
        <Typography as="label" htmlFor={name}>
          {label}
          {props.required && '*'}
        </Typography>
        {description && <Typography kind="secondary">{description}</Typography>}
        <StyledRatingGroup>
          {options.map((option) => {
            // either add default checked or checked prop
            const checked: any = {};
            if (defaultValue == option.value) checked.defaultChecked = true;
            // compare without type
            else if (value == option.value) checked.checked = true; // compare without type

            return (
              <Box key={option.value}>
                <Radio
                  ref={ref}
                  id={name + '-' + option.value}
                  type="radio"
                  name={name}
                  value={option.value}
                  {...checked}
                  {...props}
                />

                <RadioLabel htmlFor={name + '-' + option.value}>
                  {option.label}
                </RadioLabel>
              </Box>
            );
          })}
        </StyledRatingGroup>
      </Box>
    );
  },
);

RatingGroup.displayName = 'RatingGroup';

export {RatingGroup};
