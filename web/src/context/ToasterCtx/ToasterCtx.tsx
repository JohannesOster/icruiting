import React, {useState, useRef, useCallback} from 'react';
import {Toast} from './Toast';
import {ToastProps} from './types';
import {createCtx} from '../createCtx';
import {Container} from './ToasterCtx.sc';

interface ToasterCtx {
  success: (title: string) => void;
  danger: (title: string) => void;
  info: (title: string) => void;
}

const [useCtx, CtxProvider] = createCtx<ToasterCtx>();

const ToasterProvider = ({children, ...props}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const counter = useRef<number>(0);

  /* use callback for setToasts to use most recent state.
     Otherwise it will use the state of the time where bin* has been called.
     (And therefore it would use an empty Array) */
  const info = useCallback(
    (title: string) => {
      setToasts((currToasts) => [
        ...currToasts,
        {id: counter.current++, title, intent: 'none', remove: removeToast},
      ]);
    },
    [setToasts],
  );

  const success = useCallback(
    (title: string) => {
      setToasts((currToasts) => [
        ...currToasts,
        {id: counter.current++, title, intent: 'success', remove: removeToast},
      ]);
    },
    [setToasts],
  );

  const danger = useCallback(
    (title: string) => {
      setToasts((currToasts) => [
        ...currToasts,
        {id: counter.current++, title, intent: 'danger', remove: removeToast},
      ]);
    },
    [setToasts],
  );

  const removeToast = useCallback((id: number) => {
    /* If setToasts is directly used (without currToasts) setTimeout in Toasts component
      will capture the old state, wich leads to weird behaviour. */
    setToasts((currToasts: ToastProps[]) =>
      currToasts.filter((toast: ToastProps) => toast.id !== id),
    );
  }, []);

  return (
    <CtxProvider value={{success, danger, info}} {...props}>
      <Container>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </Container>
      {children}
    </CtxProvider>
  );
};

export {ToasterProvider, useCtx as useToaster};
