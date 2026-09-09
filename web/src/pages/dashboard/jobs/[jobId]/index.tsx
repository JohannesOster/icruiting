import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useTheme} from 'styled-components';
import {
  HeadingS,
  Typography,
  TColumn,
  Box,
  DataTable,
  getJobsLayout,
  DialogBody,
  DialogFooter,
} from 'components';
import {Button, Dialog, Input} from 'components';
import {API, FormCategory, TForm} from 'services';
import {useRouter} from 'next/router';
import {withAdmin} from 'components';
import config from 'config';
import {useForm} from 'react-hook-form';
import {v4 as uuidv4} from 'uuid';
import {useFetch} from 'components/useFetch';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';
import {object, string} from 'yup';

const JobDetails = () => {
  const {spacing} = useTheme();
  const router = useRouter();
  const {jobId} = router.query as {jobId: string};
  const [exporing, setExporting] = useState<string | undefined>();
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [shouldDeleteFormId, setShouldDeleteFormId] = useState<string | null>(null);

  const {data: job, error: jobError} = useFetch([`GET /jobs/${jobId}`, jobId], (_key, jobId) =>
    API.jobs.find(jobId),
  );

  const [forms, setForms] = useState<{[key: string]: TForm[]}>({});
  const {
    data,
    error: formsError,
    mutate,
    revalidate,
  } = useFetch([`GET /forms`, jobId], (_key, jobId) => API.forms.list(jobId));

  const closeReplicaDialog = () => {
    setReplicaToEdit(null);
    setFormToReplicate(null);
    reset({});
  };

  const onSubmitReplica = async (values: {replicaFormTitle: string}) => {
    if (replicaToEdit) {
      const form = ((forms.onboarding || []) as any).reduce((acc, {replicas}) => {
        const replica = replicas?.find(({formId}) => formId === replicaToEdit);
        if (!replica) return acc;
        return replica;
      }, {} as any);

      if (!form) return closeReplicaDialog();
      await API.forms.update({
        ...form,
        formTitle: values.replicaFormTitle,
      });
      revalidate();
      closeReplicaDialog();
      return;
    }

    await API.forms.create({
      formId: uuidv4(),
      jobId: job.jobId,
      formTitle: values.replicaFormTitle,
      formCategory: 'onboarding',
      formFields: [],
      replicaOf: formToReplicate,
    });
    revalidate();
    closeReplicaDialog();
  };

  const [replicaToEdit, setReplicaToEdit] = useState<string | null>(null);
  const [formToReplicate, setFormToReplicate] = useState<string | null>(null);
  const {handleSubmit, register, reset, errors, formState} = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: yupResolver(
      object({
        replicaFormTitle: string()
          .min(3, 'Formulartitel muss mindestens 3 Zeichen lang sein.')
          .max(50, 'Formulartitel darf maximal 50 Zeichen lang sein.')
          .required('Formulartitel ist verpflichtend.'),
      }),
    ),
  });

  const onDelete = () => {
    if (!shouldDeleteFormId) return;
    setDeletingFormId(shouldDeleteFormId);
    API.forms.del(shouldDeleteFormId).finally(() => {
      mutate((forms) => forms.filter(({formId}) => formId !== deletingFormId));
      setDeletingFormId(null);
    });
  };

  useEffect(() => {
    if (!data) return;
    const _forms = data.reduce((acc, curr) => {
      const cat = curr.formCategory;
      acc[cat] = acc[cat] ? acc[cat].concat(curr) : [curr];
      return acc;
    }, {} as {[key: string]: TForm[]});
    if (!_forms.onboarding?.length) return setForms(_forms);

    const onboarding = _forms.onboarding.reduce((acc, curr) => {
      if (!curr.replicaOf) {
        acc[curr.formId] = {...acc[curr.formId], ...curr};
        return acc;
      }

      if (!acc[curr.replicaOf]) acc[curr.replicaOf] = {};
      if (!acc[curr.replicaOf]?.replicas) acc[curr.replicaOf].replicas = [];
      acc[curr.replicaOf].replicas = acc[curr.replicaOf].replicas.concat([curr]);

      return acc;
    }, {} as any);

    _forms.onboarding = Object.values(onboarding);
    setForms(_forms);
  }, [data]);

  const isFetching = !(data || formsError) || !(job || jobError);

  const formBuilderURL = `/dashboard/formbuilder/`;
  const actionCell = ({formCategory, formId}: {[key: string]: any}) => {
    if (!formId) {
      return (
        <Link href={`${formBuilderURL}?formCategory=${formCategory}&jobId=${jobId}`}>
          hinzufügen
        </Link>
      );
    }

    return (
      <Box
        display="grid"
        gridColumnGap={spacing.scale200}
        gridAutoFlow="column"
        justifyContent="left"
        alignItems="center"
      >
        <Link href={`${formBuilderURL}?formId=${formId}&jobId=${jobId}`}>bearbeiten</Link>
        <span>/</span>
        <Button
          isLoading={deletingFormId === formId}
          kind="minimal"
          onClick={() => {
            setShouldDeleteFormId(formId);
          }}
        >
          löschen
        </Button>
      </Box>
    );
  };

  const baseCols: TColumn[] = [
    {
      title: 'Formular',
      cell: (row) => {
        const cat = row.formCategory;
        if (row.formTitle) return row.formTitle;
        const displayNames = {application: 'Bewerbung', screening: 'Screening'};
        return displayNames[cat];
      },
    },
    {title: 'Aktion', cell: actionCell},
    {
      title: 'JSON Export',
      cell: ({formId}) => {
        if (!formId) return <>-</>;
        return (
          <Button
            kind="minimal"
            isLoading={exporing === formId}
            onClick={() => {
              setExporting(formId);
              API.forms.exportJSON(formId).finally(() => setExporting(undefined));
            }}
          >
            JSON Export
          </Button>
        );
      },
    },
  ];
  const formsTableColumns: TColumn[] = [
    ...baseCols,
    {
      title: 'Direktlink',
      cell: ({formId}) => {
        if (!formId) return <Typography>-</Typography>;
        const domain = config.endpoint.url;
        const iframeSrc = `${domain}/forms/${formId}/html`;
        return (
          <a href={iframeSrc} rel="noopener noreferrer" target="_blank">
            Direktlink
          </a>
        );
      },
    },
  ];

  const formsData = (formCategory: FormCategory) => {
    const form = forms[formCategory];
    return form ? {...form[0]} : {formCategory};
  };
  const applicationFormsData = [formsData('application')];
  const screeningFormsData = [formsData('screening')];

  const onboardingCols: TColumn[] = [
    ...baseCols,
    {
      title: 'Replikate',
      cell: ({replicas}) => (
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {replicas?.map(({formTitle, formId: replicaFormId}) => (
              <tr key={replicaFormId}>
                <td>{formTitle}</td>
                <td>
                  <Box
                    display="grid"
                    columnGap={spacing.scale200}
                    gridAutoFlow="column"
                    justifyContent="left"
                    alignItems="center"
                  >
                    <Button
                      kind="minimal"
                      onClick={() => {
                        const title = data?.find(({formId}) => formId === replicaFormId)?.formTitle;
                        reset({replicaFormTitle: title});
                        setReplicaToEdit(replicaFormId);
                      }}
                    >
                      bearbeiten
                    </Button>
                    <span>/</span>
                    <Button kind="minimal" onClick={() => setShouldDeleteFormId(replicaFormId)}>
                      löschen
                    </Button>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      title: 'Replikat hinzufügen',
      cell: ({formId}) => (
        <Button kind="minimal" onClick={() => setFormToReplicate(formId)}>
          Replikat hinzufügen
        </Button>
      ),
    },
  ];

  return (
    <main style={{display: 'grid', rowGap: spacing.scale400}}>
      {shouldDeleteFormId && (
        <Dialog
          onClose={() => {
            setShouldDeleteFormId(null);
          }}
          title="Formular unwiderruflich löschen?"
        >
          <DialogBody>
            Sind Sie sicher, dass Sie diese Formular unwiderruflich löschen wollen? Sollte es sich
            um eine Bewerbungsformular handeln gehen sämtlich <b>Attribute aller Bewerber:innen</b>{' '}
            dieser Stelle verloren!
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={() => {
                setShouldDeleteFormId(null);
              }}
              kind="secondary"
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                onDelete();
                setShouldDeleteFormId(null);
              }}
              destructive
            >
              Löschen
            </Button>
          </DialogFooter>
        </Dialog>
      )}
      {(replicaToEdit || formToReplicate) && (
        <Dialog onClose={closeReplicaDialog} title="Replikat hinzufügen">
          <form onSubmit={handleSubmit(onSubmitReplica)}>
            <DialogBody>
              <Input
                label="Formulartitel"
                placeholder="Formulartitel"
                name="replicaFormTitle"
                ref={register}
                errors={errorsFor(errors, 'replicaFormTitle')}
                required
              />
            </DialogBody>
            <DialogFooter>
              <Button onClick={closeReplicaDialog} kind="secondary">
                Abbrechen
              </Button>
              <Button type="submit" disabled={!(formState.isValid && formState.isDirty)}>
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
      <Box display="grid" rowGap={spacing.scale200}>
        <HeadingS>Bewerbungs-Formular</HeadingS>
        <DataTable columns={formsTableColumns} data={applicationFormsData} isLoading={isFetching} />
      </Box>
      <Box display="grid" rowGap={spacing.scale200}>
        <HeadingS>Screening-Formular</HeadingS>
        <DataTable columns={baseCols} data={screeningFormsData} isLoading={isFetching} />
      </Box>
      <Box display="grid" rowGap={spacing.scale200}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <HeadingS>Assessment-Formulare</HeadingS>
          <Button
            onClick={() =>
              router.push(`/dashboard/formbuilder?formCategory=assessment&jobId=${jobId}`)
            }
          >
            Hinzufügen
          </Button>
        </Box>
        <DataTable columns={baseCols} data={forms.assessment || []} isLoading={isFetching} />
      </Box>
      <Box display="grid" rowGap={spacing.scale200}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <HeadingS>Onboarding-Formulare</HeadingS>
          <Button
            onClick={() =>
              router.push(`/dashboard/formbuilder?formCategory=onboarding&jobId=${jobId}`)
            }
          >
            Hinzufügen
          </Button>
        </Box>
        <DataTable columns={onboardingCols} data={forms.onboarding || []} isLoading={isFetching} />
      </Box>
    </main>
  );
};

JobDetails.getLayout = getJobsLayout;
export default withAdmin(JobDetails);
