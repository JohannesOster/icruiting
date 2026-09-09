import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import styled, {css} from 'styled-components';

export const Wrapper = styled.span<{isActive: boolean}>`
  text-align: left;
  padding: ${({theme}) => `${theme.spacing.scale500}`};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-right: 5px solid transparent;

  transition: background-color 200ms, border-color 200ms;

  &:hover {
    background-color: ${({theme}) => theme.colors.surfacePrimarySubdued};
    border-color: ${({theme}) => theme.colors.surfacePrimaryHover};
  }

  ${({isActive, theme}) =>
    isActive &&
    css`
      background-color: ${theme.colors.surfacePrimarySubdued};
      border-color: ${theme.colors.surfacePrimaryDefault};
    `}
`;

export const NavLink = ({href, children}) => {
  const router = useRouter();
  return (
    <Link href={href}>
      <Wrapper isActive={router.pathname === href}>{children}</Wrapper>
    </Link>
  );
};
