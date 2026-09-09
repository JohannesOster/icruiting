import React from 'react';
import {HeadingS} from 'components';
import styled from 'styled-components';

type Props = {
  title: string;
  children?: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const Form = styled.form`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale500};
`;

const Container = styled.div`
  width: 80%;
  min-width: 200px;
  max-width: 600px;
  margin: 0 auto;
  padding-top: 140px;
  display: grid;
  row-gap: ${({theme}) => theme.spacing.scale200};
`;

const AuthForm: React.FC<Props> = ({title, children, onSubmit}) => (
  <Container>
    <HeadingS>{title}</HeadingS>
    <Form onSubmit={onSubmit}>{children}</Form>
  </Container>
);

export {AuthForm};
