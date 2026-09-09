import {colors, spacing, typography, borders, breakpoints} from './concepts';
import {animations} from './primitives';

export const theme = {
  colors: {
    textDefault: '#0F172A',
    textSubdued: '#6D7175',
    textDisabled: '#8C9196',
    textOnDark: '#FFFFFF',
    textPrimary: '#006280',
    textDanger: colors.negative500,

    focus: '#458FFF',

    surfaceDefault: '#FFFFFF',
    surfaceSubdued: '#FAFBFB',

    surfacePrimaryDefault: '#006280',
    surfacePrimarySubdued: '#ECF4F9',
    surfacePrimaryHover: '#00465C',
    surfacePrimaryActive: '#032D3A',
    surfacePrimaryDisabled: '#F2F2F2',

    borderPrimary: '#006280',
    borderSubdued: '#E2E8F0',
    borderDanger: colors.negative400,

    // - button
    buttonPrimaryDestructiveFill: colors.negative400,
    buttonPrimaryDestructiveText: colors.primary0,
    buttonPrimaryDestructiveFillHover: colors.negative300,

    buttonMinimalDisabledText: colors.primary400,

    buttonMinimalFill: 'transparent',
    buttonMinimalText: colors.primary700,
    buttonMinimalTextHover: colors.primary0,

    // - inputs
    inputBorder: colors.primary100,
    inputFill: colors.primary0,
    inputBorderFocus: colors.primary500,

    inputBorderError: colors.negative400,
    inputFillErrorFocus: colors.negative50,

    inputBorderActive: colors.primary500,
    inputFillActiveError: colors.negative50,

    // - chip input
    chipBackground: colors.primary,

    // - rating group
    ratingGroupBackgroundActive: colors.primary,

    // - typography
    typographyPrimaryError: colors.negative400,
    typographySecondaryError: colors.negative300,

    // - tables
    tableBorder: colors.primary200,
    tableHeaderFill: '#F0F3F4',
    tableRowFill: colors.primary50,

    // - toasters
    toasterSuccess: colors.positive,
    toasterError: colors.negative,
    toasterInfo: colors.accent,
  },
  spacing,
  typography,
  animations,
  borders,
  breakpoints,
  shadows: {
    card: '0px 0px 5px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.15)',
    focus: '0 0 0 2px #E3EEFF',
  },
};
