import React from 'react';
import {Table as StyledTable} from './Table.sc';

type Props = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export const Table: React.FC<Props> = (props) => {
  return <StyledTable {...props} />;
};
