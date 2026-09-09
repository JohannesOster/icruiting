import styled, {css} from 'styled-components';

export const BaseToast = styled.div<{fadeOut: boolean}>`
  display: inline-flex;
  align-items: center;
  background: white;
  box-shadow: 1px 1px 5px 0px rgba(64, 64, 64, 0.3);
  margin: 8px;
  border-radius: 2px;
  padding: 16px;
  border-left: 3px solid;

  ${({theme}) => theme.typography.body};

  opacity: 1;
  animation-name: toasterAnimation;
  animation-iteration-count: 1;
  animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.175);
  animation-duration: 0.6s;

  @keyframes toasterAnimation {
    0% {
      opacity: 0;
      transform: translateY(-100%);
    }

    50% {
      transform: translateY(10%);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${({fadeOut}) => {
    if (fadeOut)
      return css`
        animation-name: fadeOut;
        animation-iteration-count: 1;
        animation-timing-function: ease-in-out;
        animation-duration: 0.6s;
        animation-fill-mode: forwards;
        animation-direction: alternate;

        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          50% {
            transform: translateY(10%);
          }
          100% {
            opacity: 0;
            transform: translateY(-100%);
          }
        }
      `;
    else return {};
  }}
`;
