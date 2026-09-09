import React, {useEffect, useReducer, useState} from 'react';
import {API, TForm} from 'services';
import {buildRadarChart} from 'utils/report-utils';
import {HeadingL, HeadingS, Table, Box, FlexGrid, getDashboardLayout, withAuth} from 'components';
import {useTheme} from 'styled-components';
import {Arrow} from 'icons';
import {Radar} from 'react-chartjs-2';
import {useRouter} from 'next/router';
import {Button} from 'components';
import {useFetch} from 'components/useFetch';
import {useAuth} from 'context';

const ToggleSections = (<T extends string[]>(...o: T) => o)(
  'applicant',
  'details',
  'requirements',
  'replicasFor',
  'openForms',
);
type ToggleSectionUnion = (typeof ToggleSections)[number];
type ToggleState = Record<ToggleSectionUnion, boolean | string | string[] | undefined>;
type ToggleAction = {type: ToggleSectionUnion; args?: any};

const ApplicantReport = () => {
  const {spacing} = useTheme();
  const router = useRouter();
  const {applicantId, formCategory} = router.query as any;
  const {currentUser} = useAuth();

  const toggleReducer = (state: ToggleState, action: ToggleAction): ToggleState => {
    if (action.type === 'openForms') {
      const curr = state.openForms as string[];
      const idx = curr.findIndex((formId) => formId === action.args);
      if (idx !== -1) curr.splice(idx, 1);
      else curr.push(action.args);
      return {...state, openForms: curr};
    }
    return {...state, [action.type]: action.args || !state[action.type]};
  };
  const [toggleState, toggleDispatch] = useReducer(toggleReducer, {
    applicant: true,
    details: true,
    requirements: true,
    replicasFor: undefined,
    openForms: [],
  });

  const toggle = (section: ToggleSectionUnion, args?: any) => {
    toggleDispatch({type: section, args});
  };

  const {data: applicant} = useFetch(
    ['GET /applicants/:applicantId', applicantId],
    (_key, applicantId) => API.applicants.find(applicantId),
  );

  const {data: report} = useFetch(
    ['GET /applicant/:applicantId/personal-report', applicantId, formCategory, currentUser.userId],
    (_key, applicantId, formCategory) =>
      API.applicants.retrievePersonalReport(applicantId, formCategory),
  );

  const [form, setForm] = useState<TForm | undefined>();
  const {data: forms, error: formsError} = useFetch(
    applicant ? [`GET /forms`, applicant.jobId] : null,
    (_key, jobId) => API.forms.list(jobId),
  );

  const {data: reportStructure} = useFetch(
    applicant ? ['GET /jobs/:jobId/report', applicant.jobId] : null,
    (_key, jobId) => API.jobs.retrieveReport(jobId),
  );

  useEffect(() => {
    if (!forms) return;
    const _form = forms.find(({formCategory}) => formCategory === 'application');
    if (!_form) return;
    setForm(_form);
  }, [forms]);

  const _buildRadarChart = () => {
    if (!(report && report.jobRequirementResults)) return {data: {}, options: {}};

    return buildRadarChart(report.jobRequirementResults as any);
  };

  const {data = {}, options = {}} = _buildRadarChart();

  return (
    <Box display="grid" rowGap={spacing.scale300}>
      <HeadingL>Persöhnliche Gesamtübersicht</HeadingL>
      Diese Übersicht berechnet nur die eigenen Bewertungen ein. Daher kann ein unvollständiges Bild
      der:des Bewerber:in entstehen.
      <Box display="grid" rowGap={spacing.scale200}>
        <div onClick={() => toggle('applicant')}>
          <FlexGrid alignItems="center" flexGap={spacing.scale200} cursor="pointer">
            <HeadingS>Bewerber:in - {applicant?.name}</HeadingS>
            <Arrow
              height={spacing.scale400}
              style={{transform: `rotate(${toggleState.applicant ? '90deg' : '-90deg'})`}}
            />
          </FlexGrid>
        </div>
        {toggleState.applicant && (
          <Table>
            <tbody>
              {reportStructure?.formFields.map((fieldId, idx) => {
                const label = form?.formFields.find(
                  ({formFieldId}) => formFieldId === fieldId,
                )?.label;
                const attribute = applicant?.attributes.find(({key}) => key === label);
                if (attribute) {
                  return (
                    <tr key={idx}>
                      <td>{attribute?.key}</td>
                      <td>{attribute?.value}</td>
                    </tr>
                  );
                }
                const file = applicant?.files.find(({key}) => key === label);
                if (!file)
                  return (
                    <tr key={idx}>
                      <td>{label}</td>
                      <td>nicht vorhanden</td>
                    </tr>
                  );
                return (
                  <tr key={idx}>
                    {file.uri?.match(/\b(?:jpeg|jpg|gif|png)\b/gi) != null ? (
                      <>
                        <td>{file.key}</td>
                        <td>
                          <img style={{maxWidth: '200px'}} src={file.uri} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <a href={file.uri} rel="noopener noreferrer" target="_blank">
                            {file.key}
                          </a>
                        </td>
                        <td></td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Box>
      {report?.formCategoryScore !== undefined && (
        <Box display="grid" rowGap={spacing.scale200}>
          <HeadingS>Übersicht</HeadingS>
          <Table>
            <tbody>
              <tr>
                <td>Gesamtscore</td>
                <td>{report?.formCategoryScore}</td>
              </tr>
            </tbody>
          </Table>
        </Box>
      )}
      <Box display="grid" rowGap={spacing.scale200}>
        <div onClick={() => toggle('details')}>
          <FlexGrid alignItems="center" flexGap={spacing.scale200} cursor="pointer">
            <HeadingS>Details</HeadingS>
            <Arrow
              height={spacing.scale400}
              style={{transform: `rotate(${toggleState.details ? '90deg' : '-90deg'})`}}
            />
          </FlexGrid>
        </div>
        {toggleState.details && (
          <Table>
            <tbody>
              {report?.formResults?.map((formScore) => (
                <React.Fragment key={formScore.formId}>
                  <tr>
                    <th>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="start"
                        gap={spacing.scale200}
                      >
                        <div onClick={() => toggle('openForms', formScore.formId)}>
                          <FlexGrid flexGap={spacing.scale200} alignItems="center" cursor="pointer">
                            <span>
                              {formScore.formTitle ||
                                {
                                  screening: 'Screening',
                                  assessment: 'Assessment',
                                  onboarding: 'Onboarding',
                                }[formCategory]}
                              {formScore.replicas &&
                                ` und ${formScore.replicas.length - 1} weitere(s) Formulare`}
                            </span>
                            <Arrow
                              height={spacing.scale400}
                              style={{
                                transform: `rotate(${
                                  !(toggleState.openForms as string[]).includes(formScore.formId)
                                    ? '90deg'
                                    : '-90deg'
                                })`,
                              }}
                            />
                          </FlexGrid>
                        </div>
                        {formScore.replicas && (
                          <Button
                            kind="minimal"
                            onClick={() => {
                              toggle(
                                'replicasFor',
                                toggleState.replicasFor ? undefined : formScore.formId,
                              );
                            }}
                          >
                            Replikate{' '}
                            {toggleState.replicasFor === formScore.formId
                              ? 'ausblenden'
                              : 'anzeigen'}
                          </Button>
                        )}
                      </Box>
                    </th>
                    <th>
                      {formScore.formScore || '-'} &isin; [{formScore.possibleMinFormScore},{' '}
                      {formScore.possibleMaxFormScore}]
                    </th>
                  </tr>

                  {/* ===================== Toggle Quantiative fields */}
                  {(toggleState.openForms as string[]).includes(formScore.formId) && (
                    <>
                      {toggleState.replicasFor === formScore.formId && (
                        <tr>
                          <td>
                            <Table>
                              <tbody>
                                <tr>
                                  <td></td>
                                  <td></td>
                                </tr>
                                {formScore.replicas?.map((replica) => (
                                  <React.Fragment key={replica.formId}>
                                    <tr key={replica.formId}>
                                      <th>
                                        {replica.formTitle ||
                                          {
                                            screening: 'Screening',
                                            assessment: 'Assessment',
                                            onboarding: 'Onboarding',
                                          }[formCategory]}
                                      </th>
                                      <th></th>
                                    </tr>
                                    {replica.formFieldScores
                                      .filter(({intent}) => intent !== 'aggregate')
                                      .map((formFieldScore) => (
                                        <tr key={formFieldScore.formFieldId}>
                                          <td>{formFieldScore.label}</td>
                                          <td>
                                            {formFieldScore.intent === 'sum_up' &&
                                              `${formFieldScore.formFieldScore}`}
                                            {formFieldScore.intent === 'count_distinct' &&
                                              Object.entries(formFieldScore.countDistinct).map(
                                                ([key, value], idx) => (
                                                  <li key={idx}>
                                                    {key}: {value}
                                                  </li>
                                                ),
                                              )}
                                          </td>
                                        </tr>
                                      ))}
                                  </React.Fragment>
                                ))}
                                <tr>
                                  <td></td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </Table>
                          </td>
                        </tr>
                      )}
                      {formScore.formFieldScores
                        .filter(({intent}) => intent !== 'aggregate')
                        .map((formFieldScore) => (
                          <tr key={formFieldScore.formFieldId}>
                            <td>{formFieldScore.label}</td>
                            <td>
                              {formFieldScore.intent === 'aggregate' && (
                                <ul
                                  style={{
                                    listStylePosition: 'outside',
                                    listStyle: 'circle',
                                    paddingLeft: '1em',
                                  }}
                                >
                                  {formFieldScore.aggregatedValues?.map(
                                    (value: any, idx: number) => (
                                      <li key={idx} style={{whiteSpace: 'pre-line'}}>
                                        {value}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                              {formFieldScore.intent === 'sum_up' &&
                                `${formFieldScore.formFieldScore}`}
                              {formFieldScore.intent === 'count_distinct' &&
                                Object.entries(formFieldScore.countDistinct).map(
                                  ([key, value], idx) => (
                                    <li key={idx}>
                                      {key}: {value}
                                    </li>
                                  ),
                                )}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* ===================== Show Aggregate fields separately */}
                  <>
                    {toggleState.replicasFor === formScore.formId && (
                      <tr>
                        <td>
                          <Table>
                            <tbody>
                              {formScore.replicas?.map((replica) => (
                                <React.Fragment key={replica.formId}>
                                  <tr key={replica.formId}>
                                    <th>
                                      {replica.formTitle ||
                                        {
                                          screening: 'Screening',
                                          assessment: 'Assessment',
                                          onboarding: 'Onboarding',
                                        }[formCategory]}
                                    </th>
                                    <th></th>
                                  </tr>
                                  {replica.formFieldScores
                                    .filter(({intent}) => intent === 'aggregate')
                                    .map((formFieldScore) => (
                                      <tr key={formFieldScore.formFieldId}>
                                        <td>{formFieldScore.label}</td>
                                        <td>
                                          <ul
                                            style={{
                                              listStylePosition: 'outside',
                                              listStyle: 'circle',
                                              paddingLeft: '1em',
                                            }}
                                          >
                                            {formFieldScore.aggregatedValues?.map(
                                              (value: string, idx) => (
                                                <li
                                                  key={idx}
                                                  style={{
                                                    whiteSpace: 'pre-line',
                                                  }}
                                                >
                                                  {value}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </td>
                                      </tr>
                                    ))}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}
                    {formScore.formFieldScores
                      .filter(({intent}) => intent === 'aggregate')
                      .map((formFieldScore) => (
                        <tr key={formFieldScore.formFieldId}>
                          <td>{formFieldScore.label}</td>
                          <td>
                            <ul
                              style={{
                                listStylePosition: 'outside',
                                listStyle: 'circle',
                                paddingLeft: '1em',
                              }}
                            >
                              {formFieldScore.aggregatedValues?.map((value: any, idx: number) => (
                                <li key={idx} style={{whiteSpace: 'pre-line'}}>
                                  {value}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                  </>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </Box>
      {['assessment', 'onboarding'].includes(formCategory) && (
        <Box display="grid" rowGap={spacing.scale200}>
          <div onClick={() => toggle('requirements')}>
            <FlexGrid alignItems="center" flexGap={spacing.scale200} cursor="pointer">
              <HeadingS>Anforderungsprofil</HeadingS>
              <Arrow
                height={spacing.scale400}
                style={{
                  transform: `rotate(${toggleState.requirements ? '90deg' : '-90deg'})`,
                }}
              />
            </FlexGrid>
          </div>
          {toggleState.requirements && (
            <>
              <Table>
                <tbody>
                  {Object.entries(report?.jobRequirementResults || {}).map(
                    ([key, requirementResult]) => (
                      <React.Fragment key={key}>
                        <tr>
                          <td>{requirementResult.requirementLabel}</td>
                          <td>{Math.round(100 * requirementResult.jobRequirementScore) / 100}</td>
                        </tr>
                      </React.Fragment>
                    ),
                  )}
                </tbody>
              </Table>
              <Radar options={options} data={data} />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

ApplicantReport.getLayout = getDashboardLayout;
export default withAuth(ApplicantReport);
