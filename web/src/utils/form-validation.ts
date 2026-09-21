import {string, ref, number} from 'yup';

export const email = string()
  .email('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
  .required('E-Mail-Adresse ist verpflichtend.');

export const confirmationCode = string().required(
  'Bestätigenscode ist verpflichtend und darf nur Ziffern beinhalten.',
);
