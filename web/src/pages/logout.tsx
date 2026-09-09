import React, {useEffect} from 'react';
import {useAuth} from 'context';
import {useRouter} from 'next/router';

const Logout: React.FC = () => {
  const {logout} = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.push('/');
    });
  }, []);

  return <></>;
};

export default Logout;
