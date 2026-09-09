import React, {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import styled from 'styled-components';
import {Button, withAuth, HeadingL, Box, getDashboardLayout} from 'components';
import {API, TForm} from 'services';
import {useRouter} from 'next/router';
import {useToaster} from 'context';
import {stringToComponent} from 'components/FormBuilder/utils';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {useFetch} from 'components/useFetch';

const Form = styled.form`
  display: grid;
  row-gap: ${({theme}) => theme.spacing.scale500};
`;

const ApplicantAssessment = () => {
  const toaster = useToaster();
  const router = useRouter();
  const {applicantId, formId} = router.query as {
    applicantId: string;
    formId: string;
  };
  type Status = 'idle' | 'deleting' | 'submitting';
  const [status, setStatus] = useState<Status>('idle');
  const {data: applicant} = useFetch(
    ['GET /applicants/:applicantId', applicantId],
    (_key, applicantId) => API.applicants.find(applicantId),
  );
  const key = applicant
    ? ['GET /form-submissions/:formId/:applicantId', formId, applicantId]
    : null;
  const {data: submission, mutate} = useFetch(
    key,
    (_key, formId, applicantId) =>
      API.formSubmissions.find(formId, applicantId),
  );

  const formsKey = applicant ? ['GET /forms', applicant.jobId] : null;
  const [form, setForm] = useState<TForm | undefined>(undefined);
  const {data} = useFetch(formsKey, (_key, jobId) => API.forms.list(jobId));

  useEffect(() => {
    if (!data) return;
    const _form = data.find((form) => form.formId === formId);
    setForm(_form);
  }, [data, formId]);

  const {register, handleSubmit, errors, formState, reset} = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (!submission) return;
    reset(submission.submission);
  }, [submission]);

  const onSubmit = (values: any) => {
    const body = {
      ...(submission ? {formSubmissionId: submission.formSubmissionId} : {}),
      formId,
      applicantId,
      submission: values,
    };

    const action = submission
      ? API.formSubmissions.update
      : API.formSubmissions.create;

    setStatus('submitting');
    action(body).then(() => {
      let txt = 'Assessment erfolgreich ';
      txt += submission ? 'bearbeitet' : 'hinzugefügt';

      toaster.success(txt);
      router.back();
    });
  };
  const formFields = form?.formFields.map((item) => {
    const Component = stringToComponent(item.component);
    // destructure to avoid passing unnecessary props to component
    const {
      defaultValue,
      formFieldId,
      jobRequirementId,
      deletable,
      editable,
      rowIndex,
      formId,
      ...props
    } = item;

    const _defaultValue = defaultValue === undefined ? '' : defaultValue;

    return (
      <Component
        ref={register({
          ...(item.required ? {required: 'Dieses Feld ist verpflichtend'} : {}),
        })}
        errors={errorsFor(errors, item.formFieldId)}
        key={item.formFieldId}
        name={item.formFieldId}
        defaultValue={_defaultValue}
        {...props}
      />
    );
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <HeadingL>
          {applicant?.name}: {form?.formTitle}
        </HeadingL>
        <Button
          disabled={!submission}
          isLoading={status === 'deleting'}
          onClick={async () => {
            setStatus('deleting');
            await API.formSubmissions
              .del(submission?.formSubmissionId)
              .then(async () => {
                toaster.success('Bewertung erfolgreich entfernt.');
                mutate(null); // clear cache otherwise 404 will not override current cache
                router.back();
              })
              .catch(toaster.danger);
            setStatus('idle');
          }}
        >
          Entfernen
        </Button>
      </Box>
      {formFields}
      <Box marginTop={20}>
        <Button
          type="submit"
          isLoading={status === 'submitting'}
          disabled={!formState.isValid}
        >
          Speichern
        </Button>
      </Box>
    </Form>
  );
};

ApplicantAssessment.getLayout = getDashboardLayout;

export default withAuth(ApplicantAssessment);
