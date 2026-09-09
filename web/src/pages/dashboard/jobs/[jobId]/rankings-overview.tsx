import React, {useState} from 'react';
import Link from 'next/link';
import {useTheme} from 'styled-components';
import {HeadingS, Box, Button, Spinner, Table, getJobsLayout, FlexGrid} from 'components';
import {API} from 'services';
import {useRouter} from 'next/router';
import {withAdmin} from 'components';
import {Edit} from 'icons';
import {useFetch} from 'components/useFetch';

const RankingsOverview = () => {
  const {spacing} = useTheme();
  const router = useRouter();
  const {jobId} = router.query as {jobId: string};

  const {data: job, error: jobError} = useFetch([`GET /jobs/${jobId}`, jobId], (_key, jobId) =>
    API.jobs.find(jobId),
  );

  const [deletingReport, setDeletingReport] = useState(false);
  const {data: report, revalidate: revalidateReport} = useFetch(
    ['GET /jobs/:jobId/report', jobId],
    (_key, jobId) => API.jobs.retrieveReport(jobId),
  );

  const isFetching = !(job || jobError);

  return (
    <main style={{display: 'grid', rowGap: spacing.scale600}}>
      <Box display="grid" rowGap={spacing.scale200}>
        <HeadingS>Anforderungsprofil</HeadingS>
        {isFetching && <Spinner />}
        {!isFetching && (
          <Table>
            <thead>
              <tr>
                <th>Anforderung</th>
                <th>Mindestmaß</th>
              </tr>
            </thead>
            <tbody>
              {job?.jobRequirements?.map(({requirementLabel, minValue}, idx) => (
                <tr key={idx}>
                  <td>{requirementLabel}</td>
                  <td>{minValue || 'Keine Angabe'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Box>
      <Box display="grid" rowGap={spacing.scale200}>
        <HeadingS>Evaluierung</HeadingS>
        <Table>
          <thead>
            <tr>
              <th>Formulartyp</th>
              <th>Ranking</th>
              <th>Datenexport</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                formCategory: 'screening',
                title: 'Screening',
                url: `/dashboard/jobs/${jobId}/ranking?formCategory=screening`,
              },
              {
                formCategory: 'assessment',
                title: 'Assessment',
                url: `/dashboard/jobs/${jobId}/ranking?formCategory=assessment`,
              },
              {
                formCategory: 'onboarding',
                title: 'Onboarding',
                url: `/dashboard/jobs/${jobId}/ranking?formCategory=onboarding`,
              },
            ].map(({title, url, formCategory}) => (
              <tr key={url}>
                <td>{title}</td>
                <td>
                  <Link href={url}>Ranking</Link>
                </td>
                <td>
                  <Button
                    kind="minimal"
                    onClick={() => {
                      API.formSubmissions.exportCSV(jobId, formCategory);
                    }}
                  >
                    CSV Export
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
      <Box display="grid" rowGap={spacing.scale200}>
        <HeadingS>Gutachen gestalten</HeadingS>
        <Table>
          <thead>
            <tr>
              <th>Gutachten</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gutachten</td>
              <td>
                {!report ? (
                  <Link href={`/dashboard/jobs/${jobId}/reportbuilder`}>hinzufügen</Link>
                ) : (
                  <Box
                    display="grid"
                    gridColumnGap={spacing.scale200}
                    gridAutoFlow="column"
                    justifyContent="left"
                    alignItems="center"
                  >
                    <Link href={`/dashboard/jobs/${jobId}/reportbuilder`}>bearbeiten</Link>
                    <span>/</span>
                    <Button
                      kind="minimal"
                      isLoading={deletingReport}
                      onClick={async () => {
                        setDeletingReport(true);
                        await API.jobs.delReport(jobId);
                        await revalidateReport();
                        setDeletingReport(false);
                      }}
                    >
                      löschen
                    </Button>
                  </Box>
                )}
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>
    </main>
  );
};

RankingsOverview.getLayout = getJobsLayout;
export default withAdmin(RankingsOverview);
