import React, {useState, useCallback, useEffect} from 'react';
import {
  DataTable,
  HeadingL,
  HeadingS,
  TColumn,
  FlexGrid,
  getDashboardLayout,
  withAdmin,
  Button,
  Select,
  ChipInput,
  Dialog,
  Typography,
  Box,
  DialogBody,
  DialogFooter,
} from 'components';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {email} from 'utils/form-validation';
import {object, array} from 'yup';
import styled, {useTheme} from 'styled-components';
import {API} from 'services';
import {useToaster} from 'context';
import {useFetch} from 'components/useFetch';

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TableFooter = styled.footer`
  display: flex;
  margin-top: ${({theme}) => theme.spacing.scale500};
  justify-content: center;
`;

type FormValues = {emails: string[]};

export const Members = () => {
  const {spacing} = useTheme();
  const toaster = useToaster();

  const {data: members, error, revalidate} = useFetch('/members', API.members.list);
  const [memberToEdit, setMembereToEdit] = useState<{
    email: string;
    userRole: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);
  const [showNewMembereForm, setShowNewMembereForm] = useState(false);

  const {errors, formState, handleSubmit, reset, control} = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(
      object({
        emails: array().of(email).required('Email(s) ist ein verpflichtendes Feld.'),
      }),
    ),
    criteriaMode: 'all',
    defaultValues: {emails: []},
  });

  const addMembere = useCallback(
    async ({emails}: {emails: string[]}) => {
      await API.members
        .create(emails)
        .then(() => {
          setShowNewMembereForm(false);
          toaster.success('Mitarbeiter erfolgreich eingeladen.');
          reset();
        })
        .catch((err) => {
          toaster.danger(err.message);
        });
    },
    [reset, toaster],
  );

  const updateMember = () => {
    if (!memberToEdit) return;
    setIsEditing(true);
    API.members
      .updateUserRole(memberToEdit.email, memberToEdit.userRole)
      .then(async () => {
        await revalidate();
        toaster.success('Mitarbeiterrolle erfolgreich gespeichert.');
        setMembereToEdit(null);
      })
      .catch((err) => {
        setMembereToEdit(null);
        toaster.danger(err.message);
      })
      .finally(() => setIsEditing(false));
  };

  const delMember = (email: string) => {
    setDeletingMember(email);
    setMemberToDelete(null); // close dialog
    API.members
      .del(email)
      .then(async () => {
        await revalidate();
        toaster.success('Mitarbeiterrolle erfolgreich entfernt.');
      })
      .catch(({message}) => toaster.danger(message))
      .finally(() => setDeletingMember(null));
  };

  const columns: TColumn[] = [
    {title: 'E-Mail-Adresse', cell: (row) => row.email},
    {
      title: 'Benutzerrolle',
      // eslint-disable-next-line react/display-name
      cell: (row) => {
        return (
          <>
            <FlexGrid flexGap={spacing.scale300}>
              <Select
                options={[
                  {label: 'Mitarbeiter', value: 'member'},
                  {label: 'Administrator', value: 'admin'},
                ]}
                defaultValue={row.user_role}
                onChange={(event) => {
                  const {value} = event.target;
                  setMembereToEdit({email: row.email, userRole: value});
                }}
              />
              <Button
                onClick={updateMember}
                disabled={
                  !memberToEdit ||
                  memberToEdit.email !== row.email ||
                  row.user_role === memberToEdit.userRole
                }
                isLoading={isEditing && memberToEdit?.email === row.email}
              >
                Speichern
              </Button>
            </FlexGrid>
          </>
        );
      },
    },
    {
      title: 'Status',
      // eslint-disable-next-line react/display-name
      cell: (row) => {
        return (
          <>
            {
              {
                CONFIRMED: 'bestätigt',
                FORCE_CHANGE_PASSWORD: 'ausstehend',
                DISABLED: 'unbekannt',
              }[row.status]
            }
          </>
        );
      },
    },
    {
      title: 'Aktion',
      // eslint-disable-next-line react/display-name
      cell: (row) => (
        <Button
          onClick={() => setMemberToDelete(row.email)}
          disabled={!!deletingMember && deletingMember !== row.email}
          isLoading={deletingMember === row.email}
          kind="minimal"
        >
          entfernen
        </Button>
      ),
    },
  ];

  return (
    <>
      {showNewMembereForm && (
        <Dialog
          onClose={() => {
            setShowNewMembereForm(false);
          }}
          title="Neuen Mitarbeiter Einladen"
        >
          <form onSubmit={handleSubmit(addMembere)}>
            <DialogBody>
              <Controller
                name="emails"
                control={control}
                render={(props) => (
                  <ChipInput
                    description='"Tab" klicken um E-Mail-Adresse zu bestätigen'
                    placeholder="E-Mail-Adresse"
                    label="E-Mail-Adresse des neuen Mitarbeiters"
                    errors={
                      errorsFor(errors, 'emails').length
                        ? errorsFor(errors, 'emails')
                        : errorsFor(errors, 'emails[0]')
                    }
                    autoFocus
                    {...props}
                  />
                )}
              />
            </DialogBody>
            <DialogFooter>
              <Button
                disabled={!(formState.isValid && formState.isDirty)}
                isLoading={formState.isSubmitting}
                type="submit"
              >
                Einladung senden
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
      {memberToDelete && (
        <Dialog
          onClose={() => setMemberToDelete(null)}
          title="Mitarbeiter:in unwiderruflich entfernen?"
        >
          <DialogBody>
            Sind Sie sicher dass Sie diesen Mitarbeiter:in entfernen möchten? Es werden alle
            zusammenhängende <b>Daten gelöscht</b> (Bewertungen)? Dieser Vorgang kann nicht
            rückgängig gemacht werden!
          </DialogBody>
          <DialogFooter>
            <Button kind="secondary" onClick={() => setMemberToDelete(null)}>
              Abbrechen
            </Button>
            <Button onClick={() => delMember(memberToDelete)} destructive>
              Löschen
            </Button>
          </DialogFooter>
        </Dialog>
      )}
      <main>
        <FlexGrid
          justifyContent="space-between"
          alignItems="center"
          flexGap={spacing.scale200}
          marginBottom={spacing.scale300}
        >
          <HeadingL>Mitarbeiter:innen</HeadingL>
          <Button onClick={() => setShowNewMembereForm(true)}>Einladen</Button>
        </FlexGrid>
        <DataTable columns={columns} data={members || []} isLoading={!(members || error)} />
      </main>
    </>
  );
};

Members.getLayout = getDashboardLayout;
export default withAdmin(Members);
