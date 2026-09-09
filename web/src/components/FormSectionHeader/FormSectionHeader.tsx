import React, {FC} from 'react';
import {HeadingS, Typography} from 'components';

interface Props {
  label: string;
  description?: string;
}

export const FormSectionHeader: FC<Props> = ({label, description}) => {
  return (
    <div>
      <HeadingS>{label}</HeadingS>
      {description && <Typography kind="secondary">{description}</Typography>}
    </div>
  );
};
