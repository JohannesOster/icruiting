export type TColumn = {
  title: string;
  cell: (row: {[key: string]: any}) => React.ReactNode;
};

export type Props = {
  /** required to store visible columns in local-storage */
  id?: string;
  /** If true loading indicator is displayed instead of data */
  isLoading?: boolean;
  /** A string that is displayed if data prop is empty */
  onEmptyMessage?: string;
  /** An array of configuration objects which "design" the columns */
  columns: TColumn[];
  /** The actual data to present */
  data: {[key: string]: any}[];
  /** The current limit (=amount of rows per page) */
  rowsPerPage?: number;
  /** Pagination: The number of pages */
  totalPages?: number;
  /** Pagination: The current of pages */
  currentPage?: number;
  /** Pagination: The total amount of data-entries  */
  totalCount?: number;
  /** Pagination: Is called if the prev button is pressed  */
  onPrev?: () => void;
  /** Pagination: Is called if the next button is pressed  */
  onNext?: () => void;
  /** Pagination: Is called if a new limit value is entered */
  onRowsPerPageChange?: (rows: number) => void;
  /** Is called if a key for ordering the data is selected */
  onOrderByChange?: (orderBy: string) => void;
  /** The current column the data is ordered by */
  orderBy?: string;
  /** An array of possible multi-select actions */
  actions?: {label: string; value: string}[];
  /** Called if an action is selected and the "execute" button is pressed */
  onAction?: (action: string, selectedIndices: number[]) => void;
  /** Is called when new filter attribute / value is set */
  onFilter?: (filter: {[attribute: string]: {eq}}) => void;
  /** Weather or not to show sort and cols selectors */
  showSortAndColsBtns?: boolean;
};
