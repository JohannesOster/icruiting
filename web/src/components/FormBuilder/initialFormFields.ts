import {RatingGroup, Input} from 'components';
import {ItemTypes} from '../../components/FormBuilder/DnD';
import {FormCategory, FormFieldIntent} from 'services';
import {DnDItem} from 'components/FormBuilder/types';
import clone from 'just-clone';
import {v4 as uuid} from 'uuid';

const applicationInitialformFields: DnDItem[] = [
  {
    id: '1',
    type: ItemTypes.FORM_FIELD,
    rowIndex: 0,
    as: Input,
    component: 'input',
    props: {
      name: 'name',
      placeholder: 'Vollständiger Name',
      label: 'Vollständiger Name',
      required: true,
    },
  },
  {
    id: '2',
    as: Input,
    component: 'input',
    type: ItemTypes.FORM_FIELD,
    rowIndex: 1,
    props: {
      name: 'email',
      placeholder: 'E-Mail-Adresse',
      label: 'E-Mail-Adresse',
      type: 'email',
      required: true,
    },
  },
];

const assessmentInitialformFields: DnDItem[] = [
  {
    id: '1',
    type: ItemTypes.FORM_FIELD,
    rowIndex: 0,
    as: RatingGroup,
    component: 'rating_group',
    props: {
      intent: FormFieldIntent.sumUp,
      label: 'Der Bewerber trägt ästhetischen Haarschmuck',
      name: `${Math.random().toString(36).substring(7)}`,
      required: true,
      options: [
        {optionId: uuid(), label: '0', value: '0'},
        {optionId: uuid(), label: '1', value: '1'},
        {optionId: uuid(), label: '2', value: '2'},
        {optionId: uuid(), label: '3', value: '3'},
        {optionId: uuid(), label: '4', value: '4'},
      ],
    },
    editable: true,
    deletable: true,
  },
];

export const getInitialFormFields = (category: FormCategory): DnDItem[] => {
  const map = {
    screening: clone(assessmentInitialformFields),
    application: clone(applicationInitialformFields),
    assessment: clone(assessmentInitialformFields),
    onboarding: clone(assessmentInitialformFields),
  };
  return map[category] || [];
};
