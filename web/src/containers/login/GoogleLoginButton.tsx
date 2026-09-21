import React from 'react';
import {useTheme} from 'styled-components';
import config from 'config';
import styles from './googleBtn.module.css';

const url = `${
  config.userPoolDomain
}/oauth2/authorize?identity_provider=Google&response_type=code&client_id=${
  config.userPoolWebClientId
}&redirect_uri=${encodeURIComponent(config.loginCallbackUrl)}`;

export const GoogleLoginButton: React.FC = () => {
  const {spacing, colors} = useTheme();
  return (
    <div
      style={{
        borderTop: '1px solid',
        borderColor: colors.inputBorder,
        paddingTop: spacing.scale500,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <a href={url} className={styles.googleBtn}>
        <div className={styles.googleIconWrapper}>
          <img className={styles.googleIcon} src="/google-logo.svg" alt="" />
        </div>
        <b className={styles.btnText}>Mit Google anmelden</b>
      </a>
    </div>
  );
};
