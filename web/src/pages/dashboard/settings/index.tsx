import React, {useEffect, useRef, useState} from 'react';
import {
  HeadingL,
  FlexGrid,
  Table,
  Box,
  withAuth,
  Button,
  Input,
  getDashboardLayout,
} from 'components';
import {useTheme} from 'styled-components';
import {useAuth, useToaster} from 'context';
import config from 'config';
import {API} from 'services';
import {useFetch, mutate} from 'components/useFetch';
import Link from 'next/link';

export const Settings = () => {
  const {spacing} = useTheme();
  const {currentUser} = useAuth();
  type Status = 'idle' | 'submitting' | 'deleting' | 'fetching';
  const [status, setStatus] = useState<Status>('fetching');
  const {danger, success} = useToaster();
  const [files, setFiles] = useState<FileList | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {data: tenant} = useFetch(
    [`GET /tenants/${currentUser?.tenantId}`, currentUser?.tenantId],
    (_key, tenantId) => API.tenants.find(tenantId),
  );

  useEffect(() => {
    if (!tenant) return;
    setStatus('idle');
  }, [tenant]);

  const uploadTheme = async () => {
    try {
      setStatus('submitting');

      const formData = new FormData();
      if (!files) throw new Error('Datei fehlt.');
      if (!files.length || !files[0]) return;
      const file = files[0];
      formData.append('theme', file);

      const token = await API.auth.token();
      const request = new XMLHttpRequest();
      request.open(
        'POST',
        `${config.endpoint.url}/tenants/${currentUser?.tenantId}/themes`,
      );
      request.setRequestHeader('Authorization', `Bearer ${token}`);
      request.onreadystatechange = () => {
        try {
          if (request.readyState === 4) {
            setStatus('idle');
            if (request.status !== 201) throw new Error(request.responseText);
            mutate([
              `GET /tenants/${currentUser?.tenantId}`,
              currentUser?.tenantId,
            ]);
            success('Theme erfolgreich hochgeladen.');
          }
        } catch (error) {
          danger(error.message);
        }
      };

      request.send(formData);
    } catch (error) {
      danger(error.message);
    }
  };

  const deleteTheme = () => {
    setStatus('deleting');
    API.tenants.themes
      .del(currentUser?.tenantId || '')
      .then(() => {
        mutate([
          `GET /tenants/${currentUser?.tenantId}`,
          currentUser?.tenantId,
        ]);
        success('Theme erfolgreich gelöscht');
      })
      .catch((error) => danger(error.message))
      .finally(() => setStatus('idle'));
  };

  return (
    <Box display="grid" rowGap={spacing.scale200}>
      <FlexGrid
        flexGap={spacing.scale300}
        justifyContent="space-between"
        alignItems="center"
      >
        <HeadingL>Theme</HeadingL>
        <a
          href="https://github.com/JohannesOster/icruiting-theme-kit.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          icruiting - Themekit
        </a>
      </FlexGrid>

      <Table>
        <thead>
          <tr>
            <th>Theme</th>
            <th>hochladen</th>
            <th>herunterladen</th>
            <th>löschen</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Theme</td>
            <td>
              <form
                ref={formRef}
                onSubmit={async () => {
                  await uploadTheme();
                  formRef.current?.reset();
                }}
              >
                <FlexGrid flexGap={spacing.scale300}>
                  <Box maxWidth="200px" overflow="hidden">
                    <Input
                      type="file"
                      accept=".css"
                      onChange={(event) => {
                        const {files} = event.target;
                        setFiles(files);
                      }}
                    />
                  </Box>
                  <Button
                    kind="minimal"
                    type="submit"
                    isLoading={status === 'submitting'}
                    disabled={!files?.length}
                  >
                    hochladen
                  </Button>
                </FlexGrid>
              </form>
            </td>
            <td>
              {tenant?.theme ? (
                <>
                  <a
                    href={tenant?.theme}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    aktuelles Theme
                  </a>
                </>
              ) : (
                '-'
              )}
            </td>
            <td>
              {tenant?.theme ? (
                <Button
                  onClick={() => {
                    deleteTheme();
                  }}
                  isLoading={status === 'deleting'}
                  disabled={status === 'fetching'}
                  kind="minimal"
                >
                  löschen
                </Button>
              ) : (
                '-'
              )}
            </td>
          </tr>
        </tbody>
      </Table>
      <HeadingL>Zahlungen</HeadingL>
      <Link href="settings/subscriptions">Subscriptions</Link>
      <Link href="settings/payment">Zahlungsmethoden</Link>
    </Box>
  );
};

Settings.getLayout = getDashboardLayout;
export default withAuth(Settings);
