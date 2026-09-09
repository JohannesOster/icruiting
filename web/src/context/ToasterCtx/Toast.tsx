import React, {useEffect} from 'react';
import {useTheme} from 'styled-components';
import {Info, Error, Success} from 'icons';
import {ToastProps} from './types';
import {BaseToast} from './Toast.sc';

export const Toast: React.FC<ToastProps> = ({
  id,
  remove,
  title,
  intent,
  duration = 4000,
}) => {
  const [fadeOut, setFadeOut] = React.useState<boolean>(false);
  const {colors} = useTheme();

  /* Map intent prop to icon */
  const Icon = ({style}: {style: React.CSSProperties}) => {
    switch (intent) {
      case 'success':
        return <Success style={style} />;
      case 'danger':
        return <Error style={style} />;
      default:
        return <Info style={style} />;
    }
  };

  /* Map intent prop to color */
  const colorForIntent = (() => {
    switch (intent) {
      case 'success':
        return colors.toasterSuccess;
      case 'danger':
        return colors.toasterError;
      default:
        return colors.toasterInfo;
    }
  })();

  /* Set timeout for autodismiss */
  useEffect(() => {
    setTimeout(() => {
      setFadeOut(() => true);
      setTimeout(() => remove(id), 800);
    }, duration);
  }, [remove, id, duration]);

  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <BaseToast
        style={{color: colorForIntent, borderColor: colorForIntent}}
        fadeOut={fadeOut}
      >
        <Icon
          style={{
            fill: colorForIntent,
            height: '16px',
            width: 'auto',
            marginRight: '16px',
          }}
        />
        {title}
      </BaseToast>
    </div>
  );
};
