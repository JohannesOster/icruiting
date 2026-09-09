type KeyValuePair<T> = {[key: string]: T};

export const buildRadarChart = (requirementResults: {
  [jobRequirementId: string]: {
    requirementLabel: string;
    jobRequirementScore: string;
    minValue: string;
  };
}): KeyValuePair<any> => {
  const requirements = Object.values(requirementResults);
  const labels = requirements.map(({requirementLabel}) => requirementLabel);
  const scores = requirements.map(
    ({jobRequirementScore}) => jobRequirementScore,
  );
  const minValues = requirements.map(({minValue}) => minValue);

  const data = {
    labels,
    datasets: [
      {
        label: 'Erzielter Wert',
        data: scores,
        backgroundColor: 'rgb(15,91,165, 0.4)',
      },
      {label: 'Mindestmaß', data: minValues},
    ],
  };

  const options = {
    pointLabelFontSize: 20,
    legend: {display: true, labels: {fontSize: 16}},
    scale: {
      ticks: {beginAtZero: true, suggestedMax: 4},
      pointLabels: {fontSize: 16},
    },
  };

  return {data, options};
};
