import React, {useCallback, useEffect, useState} from 'react';
import {Button} from 'components';
import {useTheme} from 'styled-components';
import {useForm} from 'react-hook-form';
import config from 'config';
import {API, TForm} from 'services';
import {HeadingL, Box, FlexGrid, getDashboardLayout, withAdmin} from 'components';
import {useToaster} from 'context';
import {useRouter} from 'next/router';
import {stringToComponent} from 'components/FormBuilder/utils';
import {useFetch} from 'components/useFetch';

export const EditApplicant = () => {
  const {spacing} = useTheme();
  const toaster = useToaster();

  const router = useRouter();
  const {applicantId} = router.query as {applicantId: string};
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {data: applicant} = useFetch(
    [`GET /applicants/${applicantId}`, applicantId],
    (_key, applicantId) => API.applicants.find(applicantId),
    {revalidateOnFocus: false},
  );

  const formsKey = applicant ? [`GET /forms`, applicant.jobId] : null;
  const [form, setForm] = useState<TForm | undefined>(undefined);
  const {data} = useFetch(formsKey, (_key, jobId) => API.forms.list(jobId));

  useEffect(() => {
    if (!data) return;
    const _form = data.find(({jobId, formCategory}) => {
      return jobId === applicant?.jobId && formCategory === 'application';
    });
    setForm(_form);
  }, [data, applicant]);

  const {reset, register, getValues} = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
  });

  const Form = form?.formFields.map((formField) => {
    const Component = stringToComponent(formField.component);
    const props = {
      ...formField.props,
      description: formField.description,
      label: formField.label,
      name: formField.formFieldId,
      placeholder: formField.placeholder,
      defaultValue: formField.defaultValue,
      options: formField.options,
      required: !!formField.required,
    };

    return <Component key={formField.formFieldId} {...props} ref={register} />;
  });

  const buildVals = useCallback(() => {
    if (!applicant || !form) return;

    return applicant.attributes.reduce((acc, {key, value}) => {
      const field = form.formFields.find(({label}) => label === key);
      if (!field) return acc;

      if (field.component === 'checkbox') {
        acc[field?.formFieldId] = value.split(',');
      } else acc[field?.formFieldId] = value;

      return acc;
    }, {} as any);
  }, [applicant, form]);

  useEffect(() => {
    if (!(applicant && form)) return;
    const vals = buildVals();
    reset(vals);
  }, [applicant, form, buildVals, reset]);

  const onSave = async () => {
    setIsSubmitting(true);
    const values = getValues();

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const str = (value as string[]).join(',');
        formData.append(key, str);
      } else if (typeof value === 'string') {
        formData.append(key, value as string);
      } else if (typeof value === 'object' /* = Filelist */) {
        const files = value as FileList;
        if (!files.length || !files[0]) return;
        const file = files[0];
        formData.append(key, file);
      }
    });

    const token = await API.auth.token();

    const request = new XMLHttpRequest();
    request.open('PUT', `${config.endpoint.url}/applicants/${applicantId}`);
    request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        setIsSubmitting(false);
        if (request.status !== 200) {
          toaster.danger(request.responseText);
          return;
        }
        toaster.success('Bewerber:in erfolgreich bearbeitet');
        router.back();
      }
    };
    request.send(formData);
  };

  return (
    <Box display="grid" rowGap={spacing.scale400}>
      <FlexGrid
        flexGap={spacing.scale300}
        justifyContent="space-between"
        marginBottom={spacing.scale300}
      >
        <HeadingL>Bewerber:in bearbeiten</HeadingL>
        <Box display="grid" gridAutoFlow="column" columnGap={spacing.scale500}>
          <Button isLoading={isSubmitting} onClick={onSave}>
            Speichern
          </Button>
          <Button kind="secondary" onClick={() => router.back()}>
            Abbrechen
          </Button>
        </Box>
      </FlexGrid>
      {Form}
      <input hidden ref={register} value={form?.formId || ''} onChange={() => {}} name="formId" />
    </Box>
  );
};

EditApplicant.getLayout = getDashboardLayout;

export default withAdmin(EditApplicant);
