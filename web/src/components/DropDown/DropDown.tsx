import React from 'react';
import {Container, Icon, Overlay, Content} from './DropDown.sc';
import {Typography} from 'components';
import {useTheme} from 'styled-components';

type Props = {
  label: string;
  children?: React.ReactNode;
};

const DropDown: React.FC<Props> = ({label, children}) => {
  const {spacing} = useTheme();
  return (
    <Container>
      <Typography style={{marginRight: spacing.scale300}}>{label}</Typography>
      <Icon />
      <Overlay>
        <Content>{children}</Content>
      </Overlay>
    </Container>
  );
};

export {DropDown};
