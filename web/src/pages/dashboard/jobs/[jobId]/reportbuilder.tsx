import React from 'react';
import {yupResolver} from '@hookform/resolvers';
import {
  Box,
  HeadingL,
  getDashboardLayout,
  Button,
  Checkbox,
  Spinner,
} from 'components';
import {useToaster} from 'context';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {API, TForm} from 'services';
import {useTheme} from 'styled-components';
import * as yup from 'yup';
import {useFetch} from 'components/useFetch';

type FormValues = {reportFields: string[]};

const ReportBuilder = () => {
  const {spacing} = useTheme();
  const toaster = useToaster();
  const router = useRouter();
  const {jobId} = router.query as {jobId: string};

  const {register, handleSubmit, formState, reset, errors} = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: yupResolver(
      yup.object({
        reportFields: yup
          .array()
          .min(1, 'Bitte wählen Sie mindestens ein Feld aus')
          .of(yup.string()),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    if (!report) {
      await API.jobs.createReport(jobId, values.reportFields);
    } else {
      await API.jobs.updateReport(jobId, values.reportFields);
    }
    toaster.success('Gutachten erfolgreich bearbeitet');
    router.back();
  };

  const {data: forms, error: formsError} = useFetch(
    [`GET /forms`, jobId],
    (_key, jobId) => API.forms.list(jobId),
  );

  const [form, setForm] = useState<TForm | undefined>();
  useEffect(() => {
    if (!forms) return;
    const _form = forms.find(
      ({formCategory}) => formCategory === 'application',
    );
    if (!_form) toaster.danger('Missing application form');
    setForm(_form);
  }, [forms]);

  const {data: report} = useFetch(
    ['GET /jobs/:jobId/report', jobId],
    (_key, jobId) => API.jobs.retrieveReport(jobId),
  );

  useEffect(() => {
    if (!report) return;
    reset({reportFields: report.formFields});
  }, [report]);

  return (
    <Box>
      <HeadingL>Gutachten</HeadingL>
      {!(forms || formsError) ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="grid" rowGap={spacing.scale300}>
            <Checkbox
              name="reportFields"
              errors={errorsFor(errors, 'reportFields')}
              ref={register}
              options={
                form?.formFields.map(({label, formFieldId}) => ({
                  label,
                  value: formFieldId,
                })) || []
              }
            />
            <div>
              <Button
                type="submit"
                isLoading={formState.isSubmitting}
                disabled={!formState.isValid || !formState.isDirty}
              >
                Speichern
              </Button>
            </div>
          </Box>
        </form>
      )}
    </Box>
  );
};

ReportBuilder.getLayout = getDashboardLayout;
export default ReportBuilder;
