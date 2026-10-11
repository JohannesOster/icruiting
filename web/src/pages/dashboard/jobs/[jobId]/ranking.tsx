import React from 'react';
import Link from 'next/link';
import {
  HeadingL,
  DataTable,
  TColumn,
  Box,
  getDashboardLayout,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Select,
} from 'components';
import {API} from 'services';
import {useTheme} from 'styled-components';
import {withAdmin} from 'components';
import {useRouter} from 'next/router';
import {useFetch} from 'components/useFetch';
import {useToaster} from 'context';
import {settleWithConcurrency} from 'utils/settleWithConcurrency';

export const Ranking = () => {
  const router = useRouter();
  const toaster = useToaster();
  const [isDownloadingReports, setIsDownloadingReports] = React.useState(false);
  const [isFormSelectionOpen, setIsFormSelectionOpen] = React.useState(false);
  const [selectedForm, setSelectedForm] = React.useState('');
  const {jobId, formCategory} = router.query as {
    jobId: string;
    formCategory: string;
  };
  const {spacing} = useTheme();

  const {data: applicants, error: applicantsError} = useFetch(
    `GET /applicants?jobId=${jobId}`,
    () => API.applicants.list(jobId),
  );

  const {data: ranking, error: rankingError} = useFetch(
    [`GET /rankings/${jobId}?formCategory=${formCategory}`, jobId, formCategory],
    (_key: string, jobId: string, formCategory: string) => API.rankings.find(jobId, formCategory),
  );

  const {data: forms, error: formsError} = useFetch(
    [`GET /forms/${jobId}`, jobId, formCategory],
    (_key: string, jobId: string) =>
      API.forms.list(jobId).then(
        (forms) => forms.filter((form) => form.formCategory === formCategory && !form.replicaOf), // replcas can't be downloaded individually
      ),
  );

  const isLoading =
    !(ranking || rankingError) || !(applicants || applicantsError) || !(forms || formsError);

  const columns: TColumn[] = [
    {title: 'Rang', cell: (row) => row.rank},
    {
      title: 'Name',
      cell: (row) => (
        <Link href={`/dashboard/applicants/${row.applicantId}/report?formCategory=${formCategory}`}>
          {row.name}
        </Link>
      ),
    },
    {title: 'Score', cell: (row) => row.score},
    {title: '#Bewertungen', cell: (row) => row.submissionsCount},
  ];

  const data = ranking?.map((row, index) => {
    const applicant = applicants?.applicants?.find(
      ({applicantId}) => applicantId === row.applicantId,
    );

    return {...applicant, ...row, index};
  });

  const onFormSelectionSubmit = async () => {
    const formId = selectedForm === '' ? undefined : selectedForm;
    setIsDownloadingReports(true);
    // Matches the server's two concurrent PDF renders, so a large job's requests don't sit in its
    // queue until Heroku's 30 s request timeout.
    const results = await settleWithConcurrency(data, 2, (row) =>
      API.applicants.downloadReport(row.applicantId, formCategory, row.name, formId),
    );

    const failedNames = data
      .filter((_row, i) => results[i].status === 'rejected')
      .map((row) => row.name);
    if (failedNames.length) {
      toaster.danger(
        `${failedNames.length} von ${
          data.length
        } Reports konnten nicht heruntergeladen werden: ${failedNames.join(', ')}`,
      );
    }

    setSelectedForm('');
    setIsDownloadingReports(false);
    setIsFormSelectionOpen(false);
  };
  const onFormSelectionClose = () => {
    if (isDownloadingReports) return;
    setIsFormSelectionOpen(false);
    setSelectedForm('');
  };

  return (
    <Box display="grid" rowGap={spacing.scale300}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <HeadingL>
          Ranking-
          {
            {
              screening: 'Screening',
              assessment: 'Assessment',
              onboarding: 'Onboarding',
            }[formCategory]
          }
        </HeadingL>
        <Button
          disabled={!applicants?.applicants.length}
          onClick={() => setIsFormSelectionOpen(true)}
        >
          PDF Reports herunterladen
        </Button>
      </Box>

      {isFormSelectionOpen && (
        <Dialog title="Formular auswählen" onClose={onFormSelectionClose}>
          <DialogBody>
            <Box display="flex" flexDirection="column" rowGap={8}>
              Wähle ein Formular aus für das du die Reports herunterladen möchtest.
              <Select
                options={[
                  {label: 'Alle Formulare', value: ''},
                  ...forms?.map((form) => ({
                    label: form.formTitle || 'Unbenanntes Formular',
                    value: form.formId,
                  })),
                ]}
                onChange={({target}) => setSelectedForm(target.value)}
              />
            </Box>
          </DialogBody>
          <DialogFooter>
            <Button kind="secondary" onClick={onFormSelectionClose}>
              Abbrechen
            </Button>
            <Button type="submit" isLoading={isDownloadingReports} onClick={onFormSelectionSubmit}>
              Speichern
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
    </Box>
  );
};

Ranking.getLayout = getDashboardLayout;
export default withAdmin(Ranking);
