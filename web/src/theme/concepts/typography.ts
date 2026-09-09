const defaultFontFamily = '"DM Sans", sans-serif';

export const typography = {
  displayL: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '65px',
    letterSpacing: '-0.5px',
  },
  mDisplayL: {fontSize: '32px'},
  displayM: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '52px',
  },
  mDisplayM: {fontSize: '28px'},
  displayS: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '37px',
    letterSpacing: '0.25px',
  },
  mDisplayS: {fontSize: '26px'},

  headingL: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '26px',
  },
  mHeadingL: {fontSize: '24px'},
  headingM: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '22px',
    letterSpacing: '0.15px',
  },
  mHeadingM: {fontSize: '20px'},
  headingS: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '17px',
    letterSpacing: '0.15px',
    textTransform: 'uppercase' as 'uppercase',
  },

  body: {
    fontFamily: defaultFontFamily,
    fontSize: '17px',
    letterSpacing: '0.5px',
  },
  bodySmall: {
    fontFamily: defaultFontFamily,
    fontSize: '15px',
    letterSpacing: '0.25px',
  },

  button: {
    fontFamily: defaultFontFamily,
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '1.25px',
    lineHeight: '20px',
    textTransform: 'uppercase' as 'uppercase',
  },
};
