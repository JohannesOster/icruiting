import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {v4 as uuidv4} from 'uuid';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {useTheme} from 'styled-components';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/router';

import {API, FormCategory} from 'services';
import config from 'config';
import {useToaster} from 'context';

import {
  Button,
  Input,
  Dialog,
  HeadingL,
  HeadingS,
  Typography,
  Box,
  getDashboardLayout,
  withAdmin,
  useFetch,
  CommandPalette,
  DialogBody,
} from 'components';
import {Clipboard} from 'icons';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {DnDFormField, DnDSection, DnDSourceItem} from 'components/FormBuilder/DnD';
import {DnDItem, ComponentToEdit} from 'components/FormBuilder/types';
import {EditFormFieldForm} from 'components/FormBuilder/EditFormFieldForm';
import {getSourceFormFields} from 'components/FormBuilder/sourceFormFields';
import {getInitialFormFields} from 'components/FormBuilder/initialFormFields';
import {converter} from 'components/FormBuilder/converter';
import {useFormBuilder} from 'components/FormBuilder/useFormBuilder';
import {
  DragAndDropList,
  IconContainer,
  ButtonGroup,
  Overlay,
  DnDSourceSection,
  DnDTargetSection,
  FormGrid,
  FormCodeTextarea,
  Command,
} from 'components/FormBuilder/FormBuilder.sc';
import {randString} from 'components/FormBuilder/utils';

type Query = {
  formId?: string;
  formCategory?: FormCategory;
  jobId: string;
};

const FormBuilder: React.FC = () => {
  const {colors, spacing, borders} = useTheme();
  const toaster = useToaster();
  const router = useRouter();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const {formId: formIdEdit, formCategory, jobId} = router.query as Query;

  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const formId = useRef(formIdEdit || uuidv4());

  const formKey = formIdEdit ? [`GET /forms/${formId}`, formIdEdit] : null;
  const {data: formToEdit} = useFetch(
    formKey,
    (_key, formId) => API.forms.find(formId),
    {revalidateOnFocus: false}, // do not refetch form while editing it
  );

  // fetch job for job requirements in assessment forms
  const {data: job} = useFetch([`GET /jobs/${jobId}`, jobId], (_key: string, jobId) =>
    API.jobs.find(jobId),
  );

  // form title form
  const {register, formState, errors, getValues, reset} = useForm({
    mode: 'onChange',
    defaultValues: {formTitle: formToEdit?.formTitle},
    criteriaMode: 'all',
  });

  // after fetching form to edit, reset form title
  useEffect(() => {
    if (!formToEdit) return;
    reset({formTitle: formToEdit?.formTitle});
  }, [formToEdit, reset]);

  const [componentToEdit, setComponentToEdit] = useState<null | ComponentToEdit>(null);
  const sourceItems = getSourceFormFields(formToEdit?.formCategory || formCategory);
  const initialformFields = useMemo(
    () =>
      formToEdit
        ? formToEdit.formFields
            .map(converter.toDnDItem)
            .sort((one, two) => one.rowIndex - two.rowIndex)
        : getInitialFormFields(formCategory),
    [formToEdit],
  );

  const {formFields, ...formBuilder} = useFormBuilder(initialformFields);

  /* Keyboard short cut handling */
  useEffect(() => {
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  });

  const onKey = (e: KeyboardEvent) => {
    if (componentToEdit) return;
    const inputs = ['input', 'select', 'button', 'textarea'];
    const activeElement = document.activeElement?.tagName.toLowerCase() || '';
    if (inputs.includes(activeElement)) return;
    if (e.key === 'i') {
      e.preventDefault();
      setShowCommandPalette(true);
    }
  };

  const commands = sourceItems.map((item) => ({
    ...item,
    label: item.label || '',
    id: randString(),
  }));
  const handleInsert = (cmd) => {
    if (cmd != null) {
      formFields.insert(cmd, formFields.fields.length);
      setComponentToEdit({id: cmd.id, component: cmd.component, props: cmd.props});
    }

    setShowCommandPalette(false);
  };

  // once either the form was fetched or the default initial formfields were set reset the formbuilder model
  useEffect(() => {
    if (!formToEdit) return;
    formFields.reset(initialformFields);
  }, [initialformFields]);

  // helper function, set form to edit by id
  const showEditItemForm = useCallback(
    (id: string) => {
      const {component, props} = formFields.fields.filter((item) => item.id === id)[0];
      setComponentToEdit({id, component, props});
    },
    [formFields],
  );

  /** Map the array of form source items to jsx */
  const FormSource = sourceItems.map((item: DnDItem, idx: number) => {
    const Icon = item.icon || (() => <></>);
    return (
      <DnDSourceItem key={idx} item={item}>
        <IconContainer>
          <Icon style={{height: spacing.scale400, width: spacing.scale400}} />
        </IconContainer>
        {item.label}
      </DnDSourceItem>
    );
  });

  /** Map the array of DnD formFields to jsx */
  const Form = formFields.fields.map((item: DnDItem) => {
    const Component = item.as;
    return (
      <DnDFormField
        key={item.id}
        id={item.id}
        rowIndex={item.rowIndex}
        addItem={formFields.insert}
        onMove={formFields.move}
        onDuplicate={formFields.duplicate}
        onDelete={item.deletable ? formFields.delete : undefined}
        onEdit={item.editable ? showEditItemForm : undefined}
      >
        <Component {...item.props} />
      </DnDFormField>
    );
  });

  // handle save form
  const onSave = () => {
    setStatus('submitting');
    const form = {
      formId: formId.current,
      jobId,
      formCategory: formToEdit?.formCategory || formCategory,
      formTitle: getValues().formTitle,
      formFields: formFields.fields.map(converter.toAPIFormField),
    };

    const request = formToEdit ? API.forms.update : API.forms.create;
    const sucessMsg = !formToEdit
      ? 'Formular erfolgreich erstellt.'
      : 'Formular erfolgreich bearbeitet!';

    request(form)
      .then(() => {
        toaster.success(sucessMsg);
        router.back();
      })
      .catch((error) => {
        toaster.danger(error.message);
        setStatus('idle');
      });
  };

  /** private on Drop to automatically show edit form for new items */
  const _onDrop = () => {
    const tmp = formBuilder.onDrop();
    if (tmp) showEditItemForm(tmp.toString());
  };

  /* iframe helper */
  const domain = config.endpoint.url;
  const iframeSrc = `${domain}/forms/${formId.current}/html`;
  const formCode = `<!-- Begin icruiting webform --><iframe src="${iframeSrc}" style="width: 100%; border: none;" scroll="no" id="${formId.current}-iframe" ></iframe><script>window.addEventListener("message", (event) => {if (event.origin !== "${domain}") return;document.getElementById("${formId.current}-iframe").style.height=event.data + "px";});</script><!-- End icruiting webform -->`;
  const copyCode = () => {
    const textarea = document.getElementById('form-code') as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      textarea.blur();
      toaster.success('Erfolgreich ins clipboard kopiert!');
    } else {
      toaster.danger('Fehlgeschlagen. Bitte kopieren Sie den Code manuell!');
    }
  };

  return (
    <>
      {showCommandPalette && <CommandPalette commands={commands} onSelect={handleInsert} />}
      {componentToEdit && job && (
        <Dialog onClose={() => setComponentToEdit(null)} title="Formularfeld bearbeiten">
          <EditFormFieldForm
            componentToEdit={componentToEdit}
            onSubmit={(values) => {
              formFields.edit(componentToEdit.id, values);
              setComponentToEdit(null);
            }}
            onCancel={() => setComponentToEdit(null)}
            formCategory={formToEdit?.formCategory || formCategory}
            job={job}
          />
        </Dialog>
      )}
      <Box display="flex" alignItems="center" marginBottom={spacing.scale600}>
        <HeadingL>{formToEdit ? 'Formular bearbeiten' : 'Neues Formular'}</HeadingL>
        <ButtonGroup>
          <Button kind="secondary" onClick={() => router.back()}>
            Abbrechen
          </Button>
          <Button
            onClick={onSave}
            disabled={!formState.isValid}
            isLoading={status === 'submitting'}
          >
            Speichern
          </Button>
        </ButtonGroup>
      </Box>
      <Box display="flex" position="relative" marginBottom={spacing.scale700}>
        <DnDSection
          onHover={formBuilder.onOutsideHover}
          render={(targetID, drop) => {
            const ref = useRef<HTMLDivElement>(null);
            useEffect(() => {
              if (ref.current) drop(ref.current);
            }, [ref.current]);
            return <Overlay id={targetID} ref={ref} />;
          }}
        />

        <DnDSection
          onDrop={_onDrop}
          render={(targetID, drop) => {
            const ref = useRef<HTMLDivElement>(null);
            useEffect(() => {
              if (ref.current) drop(ref.current);
            }, [ref.current]);
            return (
              <DnDTargetSection id={targetID} ref={ref}>
                <FormGrid>
                  {Form}
                  <div>
                    <Button>Absenden</Button>
                  </div>
                </FormGrid>
              </DnDTargetSection>
            );
          }}
        />
        <Box
          display="flex"
          flexDirection="column"
          gap={spacing.scale400}
          marginLeft={spacing.scale400}
        >
          <Box
            width="100%"
            background={colors.surfaceDefault}
            padding={spacing.scale400}
            borderRadius={borders.radius100}
          >
            <b>Tipp: </b> Drücke <Command>i</Command>, um ein neues Feld hinzuzufügen.
          </Box>
          <DnDSection
            onHover={formBuilder.onOutsideHover}
            render={(targetID, drop) => {
              const ref = useRef<HTMLDivElement>(null);
              useEffect(() => {
                if (ref.current) drop(ref.current);
              }, [ref.current]);
              return (
                <DnDSourceSection id={targetID} ref={ref}>
                  <Box display="grid" rowGap={spacing.scale300}>
                    {(['assessment', 'onboarding'].includes(formCategory) ||
                      ['assessment', 'onboarding'].includes(formToEdit?.formCategory)) && (
                      <Input
                        label="Formulartitel"
                        placeholder="z.B. Einzelinterview"
                        name="formTitle"
                        ref={register({
                          required: 'Formulartitel ist verpflichtend!',
                        })}
                        errors={errorsFor(errors, 'formTitle')}
                      />
                    )}
                    <HeadingS style={{marginTop: 0}}>Drag &amp; Drop</HeadingS>
                    <DragAndDropList>{FormSource}</DragAndDropList>
                    <Box
                      marginTop={spacing.scale400}
                      display="flex"
                      flexDirection="column"
                      gap={spacing.scale300}
                    >
                      {(formCategory === 'application' ||
                        formToEdit?.formCategory === 'application') && (
                        <Box display="flex" flexDirection="column">
                          <Typography
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            onClick={copyCode}
                          >
                            iFrame kopieren
                            <Clipboard
                              style={{
                                marginLeft: spacing.scale200,
                                height: spacing.scale400,
                                width: 'auto',
                              }}
                            />
                          </Typography>
                          <FormCodeTextarea
                            id="form-code"
                            rows={10}
                            onClick={copyCode}
                            defaultValue={formCode}
                          />
                        </Box>
                      )}
                      <Input
                        type="file"
                        label=".json Datei importieren"
                        onChange={(event) => {
                          const {files} = event.target;
                          const file = files[0];
                          if (!file) return;
                          const fileReader = new FileReader();
                          fileReader.onload = () => {
                            const json = fileReader.result as string;
                            const result = JSON.parse(json);
                            const _formFields = result.formFields
                              .map(converter.toDnDItem)
                              .sort((one, two) => one.rowIndex - two.rowIndex);
                            formFields.reset(_formFields);
                          };
                          fileReader.readAsText(file);
                        }}
                      />
                    </Box>
                  </Box>
                </DnDSourceSection>
              );
            }}
          />
        </Box>
      </Box>
    </>
  );
};

const DnDWrapper = () => {
  return (
    /* @ts-ignore */
    <DndProvider backend={HTML5Backend}>
      <FormBuilder />
    </DndProvider>
  );
};

DnDWrapper.getLayout = getDashboardLayout;
export default withAdmin(DnDWrapper);
