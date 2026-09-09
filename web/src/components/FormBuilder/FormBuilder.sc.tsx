import styled from 'styled-components';

export const DragAndDropList = styled.div`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale400};
`;

export const IconContainer = styled.span`
  width: ${({theme}) => theme.spacing.scale400};
  display: inline-flex;
  align-items: center;
`;

export const ButtonGroup = styled.div`
  margin-left: auto;
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: ${({theme}) => theme.spacing.scale300};
`;

export const Command = styled.span`
  padding: ${({theme}) => theme.spacing.scale50} ${({theme}) => theme.spacing.scale200};
  border-radius: ${({theme}) => theme.borders.radius100};
  ${({theme}) => theme.typography.bodySmall};
  background: ${({theme}) => theme.colors.surfacePrimarySubdued};
  border: 1px solid;
  border-color: ${({theme}) => theme.colors.borderSubdued};
  line-height: 2;
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const DnDSourceSection = styled.section`
  border-radius: ${({theme}) => theme.borders.radius100};
  padding: ${({theme}) => theme.spacing.scale300};
  z-index: 2;
  background: ${({theme}) => theme.colors.surfaceDefault};
`;

export const DnDTargetSection = styled.section`
  width: 100%;
  z-index: 2;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale600};
`;

export const FormCodeTextarea = styled.textarea`
  border: 1px solid;
  border-color: ${({theme}) => theme.colors.inputBorder};
  overflow: hidden;
  cursor: pointer;
  resize: none;
  color: ${({theme}) => theme.colors.textSubdued};
  ${({theme}) => theme.typography.bodySmall};
`;
