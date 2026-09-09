import {theme} from './theme';

// enable autocompletion with typscript
declare module 'styled-components' {
  type Theme = typeof theme;
  export interface DefaultTheme extends Theme {
    [key: string]: any; // enable other props for styled-components
  }
}
