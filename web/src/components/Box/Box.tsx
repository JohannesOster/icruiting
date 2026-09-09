import React from 'react';

type Props = {
  children?: React.ReactNode;
  as?: string | React.ComponentType<any>;
  id?: string;
} & React.CSSProperties;

export const Box: React.FC<Props> = ({children, as: Component = 'div', id, ...style}) => {
  return (
    <Component {...(id ? {id} : {})} style={style}>
      {children}
    </Component>
  );
};
