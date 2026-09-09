import React from 'react';
import {useAuth} from 'context';
import {useRouter} from 'next/router';
import {withAuth} from 'components';

// this component is responsible for redirecting admins vs non admins
const Router = () => {
  const router = useRouter();
  const {currentUser} = useAuth();

  if (currentUser.userRole === 'admin') {
    router.replace('/dashboard/jobs');
    return <></>;
  }

  router.replace('/dashboard/applicants');

  return <></>;
};

export default withAuth(Router);
