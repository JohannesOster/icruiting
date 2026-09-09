import {Box, DashboardLayout, HeadingM, HeadingS, Typography, useFetch} from 'components';
import {API} from 'services';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React from 'react';
import styled from 'styled-components';
import {Path, Report, Settings} from 'icons';

const TabBar = styled.div`
  display: flex;
  width: 100%;
  margin-top: ${({theme}) => theme.spacing.scale200};
  margin-bottom: ${({theme}) => theme.spacing.scale600};
  border-bottom: 1px solid ${({theme}) => theme.colors.borderSubdued};
`;

const TabBarItem = styled.div<{isActive?: boolean}>`
  display: flex;
  gap: ${({theme}) => theme.spacing.scale200};
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid
    ${({theme, isActive}) => (isActive ? theme.colors.borderPrimary : 'transparent')};
  ${({theme}) => theme.typography.button};
  padding: ${({theme}) => theme.spacing.scale100} ${({theme}) => theme.spacing.scale400};
  cursor: pointer;
  color: ${({theme, isActive}) => (isActive ? theme.colors.textPrimary : theme.colors.textDefault)};

  transition-property: border-color, color;
  transition-duration: ${({theme}) => theme.animations.timing100};
  transition-timing-function: ${({theme}) => theme.animations.linearCurve};

  &:hover {
    border-color: ${({theme}) => theme.colors.borderPrimary};
    color: ${({theme}) => theme.colors.textPrimary};

    > svg {
      fill: ${({theme}) => theme.colors.textPrimary};
    }
  }

  > svg {
    fill: ${({theme, isActive}) =>
      isActive ? theme.colors.textPrimary : theme.colors.textDefault};
  }
`;

const JobsLayout = ({children}) => {
  const router = useRouter();
  const {jobId} = router.query as {jobId: string};

  const {data: job} = useFetch([`GET /jobs/${jobId}`, jobId], (_key, jobId) =>
    API.jobs.find(jobId),
  );

  return (
    <DashboardLayout>
      <Box display="flex" flexDirection="column" gap="12px">
        <HeadingM>{job?.jobTitle}</HeadingM>
        <TabBar>
          <Link href={`/dashboard/jobs/${jobId}`} style={{textDecoration: 'none'}}>
            <TabBarItem isActive={router.pathname.endsWith('[jobId]')}>
              <Path />
              Formulare
            </TabBarItem>
          </Link>
          <Link
            href={`/dashboard/jobs/${jobId}/rankings-overview`}
            style={{textDecoration: 'none'}}
          >
            <TabBarItem isActive={router.pathname.endsWith('rankings-overview')}>
              <Report />
              Rankings / Gutachten
            </TabBarItem>
          </Link>

          <Link href={`/dashboard/jobs/${jobId}/settings`} style={{textDecoration: 'none'}}>
            <TabBarItem isActive={router.pathname.endsWith('settings')}>
              <Settings />
              Einstellungen
            </TabBarItem>
          </Link>
        </TabBar>
      </Box>
      {children}
    </DashboardLayout>
  );
};

const getJobsLayout = (page) => <JobsLayout>{page}</JobsLayout>;

export {JobsLayout, getJobsLayout};
