import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.3);
  z-index: 30;

  padding: ${({theme}) => theme.spacing.scale500};
`;
export const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme}) => theme.spacing.scale300};
`;

export const Suggestions = styled.div`
  background: ${({theme}) => theme.colors.surfaceDefault};
  display: flex;
  flex-direction: column;
  padding: ${({theme}) => theme.spacing.scale300};
  border-radius: ${({theme}) => theme.borders.radius100};
`;

export const CommandItem = styled.div<{isSelected: boolean}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => theme.spacing.scale300};
  cursor: pointer;
  border-radius: ${({theme}) => theme.borders.radius100};
  background-color: ${({theme, isSelected}) =>
    isSelected ? theme.colors.surfacePrimarySubdued : theme.colors.surfaceDefault};

  &:hover {
    background-color: ${({theme}) => theme.colors.surfacePrimarySubdued};
  }
`;
