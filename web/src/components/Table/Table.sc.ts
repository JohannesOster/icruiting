import styled, {css} from 'styled-components';

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;

  thead,
  tfoot {
    text-align: left;
    background: ${({theme}) => theme.colors.tableHeaderFill};
    border: 1px solid;
    border-color: ${({theme}) => theme.colors.tableBorder};

    tr {
      th,
      td {
        padding: ${({theme}) => theme.spacing.scale200};
        ${({theme}) => theme.typography.bodySmall};
        text-transform: uppercase;
        max-width: 250px;

        &:last-child {
          border: none;
        }
      }
    }
  }

  tbody {
    tr {
      border: 1px solid;
      border-color: ${({theme}) => theme.colors.tableBorder};
      ${({theme}) => theme.typography.body};

      td,
      th {
        padding: ${({theme}) => `${theme.spacing.scale300} ${theme.spacing.scale200}`};
        max-width: 30vw;

        &:last-child {
          border: none;
        }
      }

      transition-property: background-color;
      transition-duration: ${({theme}) => theme.animations.timing100};
      transition-timing-function: ${({theme}) => theme.animations.linearCurve};

      background: ${({theme}) => theme.colors.surfaceDefault};
      &:nth-child(even) {
        background-color: ${({theme}) => theme.colors.tableRowFill};
      }

      th {
        text-align: left;
      }
    }
  }

  ${({theme}) => css`
    @media (max-width: ${theme.breakpoints.md}) {
      border: 0;

      thead {
        border: none;
        clip: rect(0 0 0 0);
        margin: -1px;
        overflow: hidden;
        position: absolute;
        width: 1px;
        height: 1px;
      }

      tbody {
        tr {
          display: block;
          margin-bottom: 0.625em;
          td,
          th {
            max-width: 100vw;
          }
        }

        td {
          border-bottom: 1px solid ${theme.colors.tableBorder};
          display: -webkit-box;
          display: -moz-box;
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;

          -ms-flex-wrap: wrap;
          -webkit-flex-wrap: wrap;
          flex-wrap: wrap;

          justify-content: space-between;
        }

        td::before {
          content: attr(data-label);
          font-weight: bold;
          margin-right: ${({theme}) => theme.spacing.scale100};
        }
        td:last-child {
          border-bottom: 0;
        }
      }
    }
  `}
`;
