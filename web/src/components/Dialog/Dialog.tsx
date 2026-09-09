import React, {useEffect} from 'react';
import {Overlay, Container, Close, Header} from './Dialog.sc';
import {HeadingM} from 'components';

interface DialogProps {
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export {DialogBody, DialogFooter} from './Dialog.sc';
export const Dialog: React.FC<DialogProps> = ({onClose, title, children}) => {
  const onMouseDown = (event: React.MouseEvent) => {
    // ignore clicks on children
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const setBodyOverflow = (overflow: string) => {
    document.body.style.overflow = overflow;
  };

  useEffect(() => {
    setBodyOverflow('hidden');
    return () => {
      setBodyOverflow('unset');
    };
  });

  return (
    <Overlay onMouseDown={onMouseDown}>
      <Container>
        <Header>
          <HeadingM>{title}</HeadingM>
          <Close onClick={onClose}>
            <svg viewBox="0 0 40 40">
              <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
            </svg>
          </Close>
        </Header>
        {children}
      </Container>
    </Overlay>
  );
};
