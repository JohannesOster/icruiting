import React, {useState} from 'react';
import {useForm, useFieldArray} from 'react-hook-form';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';
import {object, array, string, number} from 'yup';
import {API, TJobRequest, TJob} from 'services';
import {
  Box,
  HeadingS,
  FlexGrid,
  withAdmin,
  Button,
  Input,
  Spinner,
  getJobsLayout,
  HeadingM,
  Typography,
  Dialog,
  DialogFooter,
  DialogBody,
} from 'components';
import {Add, Download, Trash} from 'icons';
import {useTheme} from 'styled-components';
import {useToaster} from 'context';
import {useRouter} from 'next/router';
import styled from 'styled-components';
import {useFetch} from 'components/useFetch';

const OptionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  grid-auto-flow: column;
  column-gap: ${({theme}) => theme.spacing.scale300};
  width: 100%;
  align-items: center;
`;

const Card = styled.section`
  background: ${({theme}) => theme.colors.surfaceDefault};
  border-radius: ${({theme}) => theme.borders.radius100};
  box-shadow: ${({theme}) => theme.shadows.card};
  padding: ${({theme}) => theme.spacing.scale300};
`;

const EditJob = () => {
  const toaster = useToaster();
  const {spacing} = useTheme();
  const router = useRouter();
  const {jobId} = router.query as {jobId: string};
  const [status, setStatus] = useState<'idle' | 'submitting' | 'deleting' | 'exporting'>('idle');

  const [shouldDelete, setShouldDelete] = useState(false);

  const onDelete = () => {
    if (!shouldDelete) return;
    setStatus('deleting');
    API.jobs.del(jobId).then(() => {
      toaster.success('Stelle erfolgreich gelöscht.');
      router.push('/dashboard/jobs');
    });
  };

  const {data: job, error: jobError} = useFetch(
    [`GET /jobs/${jobId}`, jobId],
    (_key: string, jobId) =>
      API.jobs.find(jobId).then((job) => {
        reset(job);
        return job;
      }),
    {revalidateOnFocus: false},
  );

  const {register, errors, control, handleSubmit, formState, reset} = useForm<TJobRequest>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {...job},
    resolver: yupResolver(
      object().shape({
        jobTitle: string()
          .min(5, 'Stellentitle muss mindestens 5 Zeichen lang sein.')
          .max(50, 'Stellentitle darf maximal 50 Zeichen lang sein.')
          .required('Stellentitel ist verpflichtend.'),
        // for each item add validationrule for the label
        jobRequirements: array().of(
          object().shape({
            requirementLabel: string().required(
              'Item ist verpflichtend auszufüllen oder zu löschen',
            ),
            minValue: number()
              .nullable()
              .transform((value: string, originalValue?: string) => {
                if (!originalValue) return null;
                if (typeof originalValue === 'string') {
                  return originalValue?.trim() === '' ? null : value;
                }

                return value;
              }),
          }),
        ),
      }),
    ),
  });

  const onSave = (job: TJobRequest) => {
    setStatus('submitting');
    const _job = {...job, jobId} as unknown as TJob;
    API.jobs
      .update(_job)
      .then(() => {
        toaster.success('Stelle erfolgreich bearbeitet.');
      })
      .catch((error) => {
        toaster.danger('Stelle konnte nicht bearbeitet werden.');
        console.error(error);
      })
      .finally(() => {
        setStatus('idle');
      });
  };

  const onExport = async () => {
    setStatus('exporting');
    await API.jobs.exportJSON(jobId).then(() => {
      toaster.success('Stelle erfolgreich exportiert.');
      setStatus('idle');
    });
  };

  const {fields, append, remove} = useFieldArray({
    control,
    name: 'jobRequirements',
  });

  return (
    <main>
      {shouldDelete && (
        <Dialog
          onClose={() => setShouldDelete(false)}
          title="Stelle wirklich unwiderruflich löschen?"
        >
          <DialogBody>
            Sind Sie sicher, dass Sie die alle mit dieser Stelle in Verbingung stehenden Daten
            löschen wollen? Das inkludiert <b>alle Bewerber:innen</b> dieser Stelle! Dieser Vorgang
            kann nicht rückgängig gemacht werden.
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => setShouldDelete(false)} kind="secondary">
              Abbrechen
            </Button>
            <Button onClick={onDelete} destructive isLoading={status === 'deleting'}>
              Löschen
            </Button>
          </DialogFooter>
        </Dialog>
      )}
      {!(job || jobError) ? (
        <Spinner />
      ) : (
        <Box display="flex" flexDirection="column" gap={spacing.scale400}>
          <Card>
            <FlexGrid justifyContent="space-between" marginBottom={spacing.scale300}>
              <HeadingM>Stellenübersicht</HeadingM>
              <Box display="grid" gridAutoFlow="column" columnGap={spacing.scale500}>
                <Button kind="secondary" onClick={() => reset()} disabled={!formState.isDirty}>
                  Abbrechen
                </Button>{' '}
                <Button
                  onClick={handleSubmit(onSave)}
                  disabled={!(formState.isValid && formState.isDirty)}
                  isLoading={status === 'submitting'}
                >
                  Speichern
                </Button>
              </Box>
            </FlexGrid>
            <form>
              <Box display="grid" rowGap={spacing.scale300}>
                <Input
                  name="jobTitle"
                  label="Stellentitel"
                  placeholder="Stellentitel"
                  ref={register}
                  errors={errorsFor(errors, 'jobTitle')}
                  required
                />
                <Box>
                  <Box
                    display="grid"
                    gap={spacing.scale200}
                    alignItems="center"
                    marginBottom={spacing.scale400}
                  >
                    <HeadingS>Anforderungsprofil*</HeadingS>
                    {fields.map((item, idx) => {
                      return (
                        <OptionContainer key={item.id}>
                          <Box flex={1}>
                            <Input
                              name={`jobRequirements[${idx}].requirementLabel`}
                              placeholder="Kriterium"
                              defaultValue={item.requirementLabel}
                              ref={register()}
                              errors={errorsFor(errors, `jobRequirements[${idx}].requirementLabel`)}
                            />
                            <input
                              name={`jobRequirements[${idx}].jobRequirementId`}
                              defaultValue={item.jobRequirementId}
                              ref={register()}
                              hidden
                            />
                          </Box>
                          <Input
                            type="number"
                            placeholder="Mindestmaß (optional)"
                            name={`jobRequirements[${idx}].minValue`}
                            ref={register()}
                            defaultValue={item.minValue}
                            errors={errorsFor(errors, `jobRequirements[${idx}].minValue`)}
                          />
                          <Trash
                            onClick={() => remove(idx)}
                            style={{
                              height: spacing.scale400,
                              width: 'auto',
                              marginLeft: spacing.scale200,
                              cursor: 'pointer',
                            }}
                          />
                        </OptionContainer>
                      );
                    })}
                  </Box>
                  <Box>
                    <Button kind="minimal" onClick={() => append({requirementLabel: ''})}>
                      <Add style={{marginRight: spacing.scale200}} fill="currentColor" />
                      Neues Item
                    </Button>
                  </Box>
                </Box>
              </Box>
            </form>
          </Card>
          <Card>
            <Box display="flex" flexDirection="column" gap={spacing.scale300}>
              <HeadingM>Sonstiges</HeadingM>
              <Box display="flex" flexDirection="column" gap={spacing.scale600}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  gap={spacing.scale200}
                >
                  <Typography kind="secondary">
                    Lade diese Stelle herunter, um sie später als Vorlage verwenden zu können.{' '}
                    <b>Wichtig:</b> Bewerber:innen werden NICHT heruntergeladen.
                  </Typography>
                  <Button kind="minimal" onClick={onExport} isLoading={status === 'exporting'}>
                    <Download
                      style={{marginRight: spacing.scale200, height: 16}}
                      fill="currentColor"
                    />
                    JSON Export
                  </Button>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  gap={spacing.scale200}
                >
                  <Typography kind="secondary">
                    Alle mit dieser Stelle in Verbingung stehenden Daten löschen. Das inkludiert
                    alle Bewerber:innen dieser Stelle! Dieser Vorgang kann nicht rückgängig gemacht
                    werden.
                  </Typography>
                  <Button kind="minimal" destructive onClick={() => setShouldDelete(true)}>
                    <Trash
                      style={{marginRight: spacing.scale200, height: 16}}
                      fill="currentColor"
                    />
                    Stelle entfernen
                  </Button>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      )}
    </main>
  );
};

EditJob.getLayout = getJobsLayout;
export default withAdmin(EditJob);
