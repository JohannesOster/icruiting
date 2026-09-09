import styled, {DefaultTheme} from 'styled-components';

type TKind = 'body' | 'secondary';
type TColor = 'primary' | 'secondary' | 'error';

export const Typography = styled.span<{kind?: TKind; color?: TColor}>`
  ${({theme, kind}) => getStylesForKind(theme, kind)};
  color: ${({theme, color}) => getColor(theme, color)};
`;

const getStylesForKind = (theme: DefaultTheme, kind?: TKind) => {
  switch (kind) {
    case 'secondary':
      return {
        ...theme.typography.bodySmall,
        color: theme.colors.textSubdued,
      };
    default:
      return {
        ...theme.typography.body,
        color: theme.colors.textDefault,
      };
  }
};

export const getColor = (theme: DefaultTheme, color?: TColor) => {
  switch (color) {
    case 'primary':
      return theme.colors.textDefault;
    case 'secondary':
      return theme.colors.textSubdued;
    case 'error':
      return theme.colors.typographyPrimaryError;
  }
};

export const DisplayL = styled.h1`
  ${({theme}) => theme.typography.displayL}
  @media (max-width: ${({theme}) => theme.breakpoints.md}) {
    ${({theme}) => theme.typography.mDisplayL}
  }
`;

export const DisplayM = styled.h2`
  ${({theme}) => theme.typography.displayM}
  @media (max-width: ${({theme}) => theme.breakpoints.md}) {
    ${({theme}) => theme.typography.mDisplayM}
  }
`;

export const DisplayS = styled.h3`
  ${({theme}) => theme.typography.displayS}
  @media (max-width: ${({theme}) => theme.breakpoints.md}) {
    ${({theme}) => theme.typography.mDisplayS}
  }
`;

export const HeadingL = styled.h4`
  ${({theme}) => theme.typography.headingL}
  @media (max-width: ${({theme}) => theme.breakpoints.md}) {
    ${({theme}) => theme.typography.mHeadingL}
  }
`;

export const HeadingM = styled.h5`
  ${({theme}) => theme.typography.headingM}
  @media (max-width: ${({theme}) => theme.breakpoints.md}) {
    ${({theme}) => theme.typography.mHeadingM}
  }
`;

export const HeadingS = styled.h1`
  ${({theme}) => theme.typography.headingS}
`;
