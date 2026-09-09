import {string, ref, number} from 'yup';

export const email = string()
  .email('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
  .required('E-Mail-Adresse ist verpflichtend.');

export const password = string()
  .min(6, 'Passwort muss mindestens 6 Zeichen lang sein.')
  .test('hasLowerCase', 'Passwort muss mindestens einen Kleinbuchstaben beinhalten.', (value) =>
    /[a-z]/.test(value),
  )
  .test('hasUpperCase', 'Passwort muss mindestens einen Großbuchstaben beinhalten.', (value) =>
    /[A-Z]/.test(value),
  )
  .test(
    'hasSpecialCharacter',
    'Passwort muss mindestens eine Spezialzeichen (@,!,#, etc) beinhalten.',
    (value) => /[^A-Za-z0-9]/.test(value),
  )
  .required('Passwort ist verpflichtend.');

export const tenantName = string()
  .min(3, 'Tenantname muss  mindestens 3 Zeichen lang sein.')
  .required('Tenantname ist verpflichtend.');

export const confirmationCode = string().required(
  'Bestätigenscode ist verpflichtend und darf nur Ziffern beinhalten.',
);
