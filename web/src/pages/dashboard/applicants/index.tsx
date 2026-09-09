import React, {useEffect, useReducer, useRef, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useTheme} from 'styled-components';
import {API} from 'services';
import {useAuth} from 'context';
import {
  DataTable,
  Table,
  TColumn,
  HeadingL,
  FlexGrid,
  getDashboardLayout,
  Button,
  Dialog,
  withAuth,
  DialogBody,
  DialogFooter,
  AdvancedSelect,
} from 'components';
import {useQueryReducer} from 'components/useQueryReducer';
import {useFetch} from 'components/useFetch';

const Applicants = () => {
  const router = useRouter();

  const queryStorageKey = 'applicants-query';
  const _queryInit = localStorage.getItem(queryStorageKey);
  const _queryJSON = JSON.parse(_queryInit);

  const {query, setLimit, setFilter, order, next, prev} = useQueryReducer(
    _queryJSON ? _queryJSON : undefined,
  );
  const {offset, limit, filter, order: orderBy} = query;
  const {spacing} = useTheme();
  const {currentUser} = useAuth();

  useEffect(() => {
    if (!query) return;
    localStorage.setItem(queryStorageKey, JSON.stringify(query));
  }, [query]);

  const sortLocalStorageKey = useRef(`${currentUser.userId}-applicants-sort`);
  useEffect(() => {
    let sort = localStorage.getItem(sortLocalStorageKey.current);
    if (!sort) return;
    order(sort);
  }, []);

  const selectedJobLocalStorageKey = useRef(`${currentUser.userId}-applicants-job`);
  const {data: jobs, error: jobsError} = useFetch('GET /jobs', API.jobs.list);
  const [selectedJobId, setSelectedJobId] = useState(
    localStorage.getItem(selectedJobLocalStorageKey.current) || (jobs && jobs[0]?.jobId),
  );

  const key = selectedJobId
    ? ['GET /applicants', selectedJobId, offset, filter, limit, orderBy]
    : null;

  const {
    data: applicantsResponse,
    error: applicantsError,
    revalidate,
  } = useFetch(key, (_key, jobId, offset, filter, limit, orderBy) =>
    API.applicants.list(jobId, {
      offset,
      limit,
      filter,
      orderBy,
    }),
  );

  const {data: forms} = useFetch(['GET /forms', selectedJobId], (_key, jobId) =>
    API.forms.list(jobId),
  );

  const form = forms?.find(({formCategory}) => formCategory === 'application');

  useEffect(() => {
    if (!jobs?.length) return;
    if (selectedJobId && jobs.map(({jobId}) => jobId).includes(selectedJobId)) return;
    const jobId = jobs[0].jobId;
    setSelectedJobId(jobId);
    localStorage.setItem(selectedJobLocalStorageKey.current, jobId);
  }, [jobs]);

  // Checking for undefined because empty array should lead to loading indicator
  const loadingJob = jobs === undefined && !jobsError;
  const loadingApplicants = jobs && applicantsResponse === undefined && !applicantsError; // if jobs are empty, applicants request never starts due null key useFetch
  const isLoading = loadingJob || loadingApplicants;

  enum BulkAction {
    delete = 'delete',
    download = 'download',
  }
  type State = {
    bulkAction?: BulkAction;
    bulkActionIndices?: number[];
    bulkActionStatus?: 'pending' | 'requestConfirmation';
    currentJobId?: string;
    status: 'idle' | 'loading';
  };
  type ActionType =
    | 'requestBulkActionConfirmation'
    | 'cancelBulkAction'
    | 'confirmBulkAction'
    | 'resetBulkAction';
  type Action = {type: ActionType; payload?: any};

  const bulkDelete = async (indices: number[]) => {
    const promises = indices.map((index) => {
      const applicant = applicantsResponse.applicants[index];
      return API.applicants.del(applicant.applicantId);
    });

    await Promise.all(promises);
    await revalidate();
    dispatch({type: 'resetBulkAction'});
  };

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'requestBulkActionConfirmation': {
          const {bulkAction, bulkActionIndices} = action.payload;
          return {
            ...state,
            bulkAction,
            bulkActionIndices,
            bulkActionStatus: 'requestConfirmation',
          };
        }
        case 'resetBulkAction':
        case 'cancelBulkAction': {
          const _state = {...state};
          delete _state.bulkAction;
          delete _state.bulkActionIndices;
          delete _state.bulkActionStatus;
          return _state;
        }
        case 'confirmBulkAction': {
          switch (state.bulkAction) {
            case BulkAction.delete: {
              bulkDelete(state.bulkActionIndices);
            }
          }
          return {...state, bulkActionStatus: 'pending'};
        }
      }
    },
    {status: 'idle'},
  );

  const columns: TColumn[] = [
    ...(form?.formFields.map(({label}) => ({
      title: label,
      cell: (row) => {
        let attr = row.attributes.find(({key}) => label === key);
        if (!attr?.value) attr = row.files.find(({key}) => label === key);

        if (attr?.value !== row.name) {
          return attr?.value || (attr?.uri ? <Link href={attr.uri}>{attr.key}</Link> : '');
        }

        return <Link href={`${router.pathname}/${row.applicantId}`}>{row.name}</Link>;
      },
    })) || []),
    {
      title: 'Bewertungsübersicht',
      cell: ({assessments}) => (
        <Table>
          <tbody>
            {assessments?.map(({formTitle, formCategory, score}, idx) => (
              <tr key={idx}>
                <td>
                  {formTitle ||
                    {
                      screening: 'Screening',
                      assessment: 'Assessment',
                      onboarding: 'Onboarding',
                    }[formCategory]}
                </td>
                <td>{score}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ),
    },
    {
      title: 'Bewerber:innenstatus',
      cell: ({applicantStatus}) => <span>{applicantStatus}</span>,
    },
  ];

  const bulkActions = [
    {label: 'löschen', value: BulkAction.delete},
    {label: '.csv download', value: BulkAction.download},
  ];
  const onBulkAction = (bulkAction: BulkAction, bulkActionIndices: number[]) => {
    switch (bulkAction) {
      case BulkAction.delete: {
        dispatch({
          type: 'requestBulkActionConfirmation',
          payload: {bulkAction, bulkActionIndices},
        });
        break;
      }
      case BulkAction.download: {
        const _data = applicantsResponse.applicants
          .filter((_applicants, index) => bulkActionIndices.includes(index))
          .map(({applicantId, attributes}) => ({
            applicantId,
            ...attributes.reduce((acc, curr) => {
              acc[curr.key] = curr.value;
              return acc;
            }, {}),
          }));

        const colDelimiter = ';';
        const rowDelimiter = '\n';

        // NOTE: only works if every row has the same attributes.
        // Otherwise a reduce method to get alls headers has to be implemented
        const headers = Object.keys(_data[0]);

        const escape = (str: string) => {
          return JSON.stringify(str);
        };

        let csv = headers.map(escape).join(colDelimiter) + rowDelimiter;

        csv += _data
          .map((row) => {
            return headers.map((header) => escape(row[header])).join(colDelimiter);
          })
          .join(rowDelimiter);

        const filename = 'icruiting-export.csv';
        const encoded = 'data:text/csv;charset=utf-8,' + encodeURI(csv);

        const link = document.createElement('a');
        link.setAttribute('href', encoded);
        link.setAttribute('download', filename);
        link.click();

        break;
      }
    }
  };

  return (
    <main>
      {state.bulkActionStatus && (
        <Dialog
          onClose={() => {
            if (state.bulkActionStatus === 'pending') return;
            dispatch({type: 'cancelBulkAction'});
          }}
          title="Bewerber:innen wirklich unwiderruflich löschen?"
        >
          <DialogBody>
            Sind Sie sicher, dass Sie alle Daten der ausgewählten Bewerbers:innen löschen wollen?
            Dieser Vorgang kann nicht rückgängig gemacht werden.
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={() => dispatch({type: 'cancelBulkAction'})}
              disabled={state.bulkActionStatus === 'pending'}
              kind="secondary"
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => dispatch({type: 'confirmBulkAction'})}
              isLoading={state.bulkActionStatus === 'pending'}
              destructive
            >
              Löschen
            </Button>
          </DialogFooter>
        </Dialog>
      )}
      <FlexGrid
        justifyContent="space-between"
        alignItems="center"
        flexGap={spacing.scale300}
        marginBottom={spacing.scale300}
      >
        <HeadingL>Bewerbungen</HeadingL>
        {jobs && (
          <AdvancedSelect
            label="Stelle:"
            options={jobs.map((job) => ({
              label: job.jobTitle,
              value: job.jobId,
            }))}
            onChange={(event) => {
              const {value} = event.target;
              setSelectedJobId(value);
              localStorage.setItem(selectedJobLocalStorageKey.current, value);
            }}
            value={selectedJobId}
          />
        )}
      </FlexGrid>
      <DataTable
        id={`${currentUser.userId}-${selectedJobId}-applicants-dt`}
        columns={columns}
        data={applicantsResponse?.applicants || []}
        isLoading={isLoading}
        totalCount={applicantsResponse?.totalCount || 0}
        totalPages={Math.ceil((applicantsResponse?.totalCount || 0) / limit)}
        currentPage={Math.round(offset / limit) + 1}
        onPrev={prev}
        onNext={next}
        onRowsPerPageChange={setLimit}
        onOrderByChange={(by) => {
          order(by);
          localStorage.setItem(sortLocalStorageKey.current, by);
        }}
        orderBy={orderBy}
        rowsPerPage={limit}
        actions={currentUser.userRole === 'admin' ? bulkActions : undefined}
        onAction={onBulkAction}
        onFilter={setFilter}
        showSortAndColsBtns={true}
      />
    </main>
  );
};

Applicants.getLayout = getDashboardLayout;
export default withAuth(Applicants);
