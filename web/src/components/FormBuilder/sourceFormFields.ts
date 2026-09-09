import {ItemTypes} from '../../components/FormBuilder/DnD';
import {RatingGroup, FormSectionHeader, Input, Select, Textarea, Radio, Checkbox} from 'components';
import {
  Area,
  Select as SelectIcon,
  Radio as RadioIcon,
  Cursor,
  Rating,
  Textarea as TextareaIcon,
  Checkbox as CheckboxIcon,
  Heading,
  Hash,
  Calendar,
  Mail,
  File,
  Phone,
} from 'icons';
import {FormFieldIntent, FormCategory} from 'services';
import {DnDItem} from 'components/FormBuilder/types';
import {v4 as uuid} from 'uuid';

const DNDBase = {
  type: ItemTypes.FORM_FIELD,
  id: '',
  rowIndex: -1,
};

const applicationFormSourceFields: DnDItem[] = [
  {
    ...DNDBase,
    label: 'Überschrift',
    icon: Heading,
    as: FormSectionHeader,
    component: 'section_header',
    props: {label: 'Überschrift'},
  },
  {
    ...DNDBase,
    icon: Cursor,
    label: 'Textfeld',
    as: Input,
    component: 'input',
    props: {placeholder: 'Textfeld', label: 'Textfeld', type: 'text'},
  },
  {
    ...DNDBase,
    icon: Hash,
    label: 'Nummernfeld',
    as: Input,
    component: 'input',
    props: {placeholder: 'Nummernfeld', label: 'Nummernfeld', type: 'number'},
  },
  {
    ...DNDBase,
    icon: Calendar,
    label: 'Datum',
    as: Input,
    component: 'input',
    props: {label: 'Datum', type: 'date'},
  },
  {
    ...DNDBase,
    icon: Mail,
    label: 'E-Mail-Addresse',
    as: Input,
    component: 'input',
    props: {placeholder: 'E-Mail-Addresse', label: 'E-Mail-Addresse', type: 'email'},
  },
  {
    ...DNDBase,
    icon: Phone,
    label: 'Telefonnummer',
    as: Input,
    component: 'input',
    props: {placeholder: 'Telefonnummer', label: 'Telefonnummer', type: 'tel'},
  },
  {
    ...DNDBase,
    icon: TextareaIcon,
    label: 'Textarea',
    as: Textarea,
    component: 'textarea',
    props: {label: 'Textarea', placeholder: 'Textarea'},
  },
  {
    ...DNDBase,
    icon: SelectIcon,
    label: 'Select',
    as: Select,
    component: 'select',
    props: {
      label: 'Select',
      options: [
        {option: uuid(), label: 'Option-1', value: 'Option-1'},
        {option: uuid(), label: 'Option-2', value: 'Option-2'},
      ],
    },
  },
  {
    ...DNDBase,
    icon: RadioIcon,
    label: 'Radio',
    as: Radio,
    component: 'radio',
    props: {
      label: 'Radio',
      options: [
        {option: uuid(), label: 'Option-1', value: 'Option-1'},
        {option: uuid(), label: 'Option-2', value: 'Option-2'},
      ],
    },
  },
  {
    ...DNDBase,
    icon: CheckboxIcon,
    label: 'Checkbox',
    as: Checkbox,
    component: 'checkbox',
    props: {
      label: 'Checkbox',
      options: [
        {option: uuid(), label: 'Option-1', value: 'Option-1'},
        {option: uuid(), label: 'Option-2', value: 'Option-2'},
      ],
    },
  },
  {
    ...DNDBase,
    icon: File,
    label: 'Datei',
    as: Input,
    component: 'file_upload',
    props: {type: 'file', label: 'Datei', accept: 'application/pdf'},
  },
];

const assessmentSourceFields: DnDItem[] = [
  {
    ...DNDBase,
    icon: Rating,
    label: 'Rating',
    as: RatingGroup,
    component: 'rating_group',
    props: {
      intent: FormFieldIntent.sumUp,
      label: 'Rating',
      name: `${Math.random().toString(36).substring(7)}`,
      options: [
        {optionId: uuid(), label: '0', value: '0'},
        {optionId: uuid(), label: '1', value: '1'},
        {optionId: uuid(), label: '2', value: '2'},
        {optionId: uuid(), label: '3', value: '3'},
        {optionId: uuid(), label: '4', value: '4'},
      ],
    },
  },
  {
    ...DNDBase,
    icon: Area,
    label: 'Textarea',
    as: Textarea,
    component: 'textarea',
    props: {
      label: 'Textarea',
      placeholder: 'Textarea',
      intent: FormFieldIntent.aggregate,
    },
  },
  {
    ...DNDBase,
    label: 'Überschrift',
    icon: Heading,
    as: FormSectionHeader,
    component: 'section_header',
    props: {label: 'Überschrift'},
  },
];

export const getSourceFormFields = (category: FormCategory): DnDItem[] => {
  const map = {
    screening: assessmentSourceFields,
    application: applicationFormSourceFields,
    assessment: assessmentSourceFields,
    onboarding: assessmentSourceFields,
  };
  return map[category] || [];
};
