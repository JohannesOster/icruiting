import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';
import {useTheme} from 'styled-components';
import {Table, Box, HeadingS, DataTable, FlexGrid, getDashboardLayout} from 'components';
import {Button} from 'components';
import {API, TForm} from 'services';
import {Arrow, Edit} from 'icons';
import {useAuth, useToaster} from 'context';
import {withAuth} from 'components';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {stringToComponent} from 'components/FormBuilder/utils';
import {useFetch} from 'components/useFetch';

const ApplicantDetails = () => {
  const toaster = useToaster();
  const {colors, spacing} = useTheme();
  const router = useRouter();
  const {applicantId} = router.query as {applicantId: string};
  const [showScreeningForm, setShowScreeningForm] = useState(true);

  type Status = 'idle' | 'confirming' | 'submitting';
  const [status, setStatus] = useState<Status>('idle');
  const {data: applicant} = useFetch(
    ['GET /applicants/:applicantId', applicantId],
    (_key: string, applicantId: string) => API.applicants.find(applicantId),
  );

  const {currentUser} = useAuth();

  const formsKey = applicant ? [`GET /forms`, applicant.jobId] : null;
  const [forms, setForms] = useState<{[key: string]: TForm[]}>({});
  const {data} = useFetch(formsKey, (_key, jobId) => API.forms.list(jobId));

  useEffect(() => {
    if (!data) return;
    const _forms = data.reduce((acc, curr) => {
      const cat = curr.formCategory;
      acc[cat] = acc[cat] ? acc[cat].concat(curr) : [curr];
      return acc;
    }, {} as any);
    setForms(_forms);
  }, [data]);

  const screeningForms = forms.screening as TForm[];
  const screeningForm = screeningForms && screeningForms[0];

  const key =
    applicant && screeningForm
      ? ['GET /form-submissions/:formId/:applicantId', screeningForm.formId, applicantId]
      : null;
  const {data: submission} = useFetch(key, (_key, formId, applicantId) =>
    API.formSubmissions.find(formId, applicantId),
  );

  const {register, handleSubmit, errors, formState, reset} = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (!submission) return;
    reset(submission.submission);
  }, [submission]);

  const onSubmit = (values: any) => {
    if (!screeningForm) return;
    const body = {
      ...(submission ? {formSubmissionId: submission.formSubmissionId} : {}),
      applicantId,
      formId: screeningForm.formId,
      submission: values,
    };

    const action = submission ? API.formSubmissions.update : API.formSubmissions.create;

    setStatus('submitting');
    action(body).then(() => {
      let txt = 'Assessment erfolgreich ';
      txt += submission ? 'bearbeitet' : 'hinzugefügt';

      toaster.success(txt);
      router.back();
    });
  };

  const formFields = screeningForm?.formFields
    .filter((field) => field.visibility === 'all' || currentUser.userRole === 'admin')
    .map((item) => {
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

      const _defaultValue = defaultValue || '';

      if (item.component === 'checkbox') {
        return (
          <Component
            ref={register({
              ...(item.required ? {required: 'Dieses Feld ist verpflichtend'} : {}),
            })}
            errors={errorsFor(errors, item.formFieldId)}
            key={item.formFieldId}
            name={item.formFieldId}
            defaultValue={(_defaultValue as string)?.split(',')}
            {...props}
          />
        );
      }

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
    <Box display="grid" gridRowGap={spacing.scale700}>
      <section>
        <Box display="flex" justifyContent="space-between">
          <FlexGrid flexGap={spacing.scale300} alignItems="center" marginBottom={spacing.scale300}>
            <HeadingS>Bewerber:innendaten</HeadingS>
            {currentUser?.userRole === 'admin' && (
              <Edit
                style={{cursor: 'pointer'}}
                onClick={() => router.push(`/dashboard/applicants/${applicantId}/edit`)}
              />
            )}
          </FlexGrid>
          {currentUser.userRole === 'admin' && (
            <Button
              onClick={async () => {
                setStatus('confirming');
                await API.applicants.confirm(applicantId);
                toaster.success('Erfolgreich bestätigt!');
                setStatus('idle');
              }}
              isLoading={status === 'confirming'}
            >
              Bestätigen
            </Button>
          )}
        </Box>
        <Table style={{width: 'auto'}}>
          <tbody>
            <tr>
              <td>Beworben am</td>
              <td>{new Date(applicant?.createdAt || '').toLocaleString()}</td>
            </tr>
            {applicant?.attributes.map((attr, idx) => (
              <tr key={idx}>
                <td style={{borderRight: '1px solid ' + colors.inputBorder}}>{attr.key}</td>
                <td>{attr.value.toString()}</td>
              </tr>
            ))}
            {applicant?.files?.map((file, idx) => (
              <tr key={idx}>
                <td>
                  <a href={file.uri} rel="noopener noreferrer" target="_blank">
                    {file.key}
                  </a>
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div onClick={() => setShowScreeningForm((curr) => !curr)} style={{cursor: 'pointer'}}>
          <FlexGrid alignItems="center" flexGap={spacing.scale200}>
            <HeadingS>Screening-Formular</HeadingS>
            <Arrow
              height={spacing.scale400}
              style={{
                transform: `rotate(${showScreeningForm ? '90deg' : '-90deg'})`,
              }}
            />
          </FlexGrid>
        </div>
        {showScreeningForm && (
          <Box display="grid" gridRowGap={spacing.scale500} paddingTop={spacing.scale200}>
            {formFields}
            {formFields?.length && (
              <Box marginTop={spacing.scale300}>
                <Button
                  type="submit"
                  isLoading={status === 'submitting'}
                  disabled={!formState.isValid}
                >
                  Speichern
                </Button>
              </Box>
            )}
            {!formFields?.length && 'Kein Screeningformular vorhanden'}
          </Box>
        )}
      </form>
      <Box display="flex" flexDirection="column" gap={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <HeadingS>Assessment-Formulare</HeadingS>
          <Link
            href={`/dashboard/applicants/${applicant?.applicantId}/personal-report?formCategory=assessment`}
          >
            Persönliche Gesamtübersicht
          </Link>
        </Box>
        <DataTable
          data={forms.assessment || []}
          columns={[
            {
              title: 'Formular',
              cell: (row) => (
                <Link
                  href={`/dashboard/applicants/${applicant?.applicantId}/assessment?formId=${row.formId}`}
                >
                  {row.formTitle}
                </Link>
              ),
            },
          ]}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <HeadingS>Onboarding-Formulare</HeadingS>
          <Link
            href={`/dashboard/applicants/${applicant?.applicantId}/personal-report?formCategory=onboarding`}
          >
            Persönliche Gesamtübersicht
          </Link>
        </Box>
        <DataTable
          data={forms.onboarding || []}
          columns={[
            {
              title: 'Formular',
              cell: (row) => (
                <Link
                  href={`/dashboard/applicants/${applicant?.applicantId}/assessment?formId=${row.formId}`}
                >
                  {row.formTitle}
                </Link>
              ),
            },
          ]}
        />
      </Box>
    </Box>
  );
};

ApplicantDetails.getLayout = getDashboardLayout;

export default withAuth(ApplicantDetails);
