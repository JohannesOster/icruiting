import {ReactNode} from 'react';

export const ItemType = 'OPTION';

export type DragItem = {
  index: number;
  type: string;
};

export interface DnDOptionContainerProps {
  index: number;
  onDelete?: (index: number) => void;
  move: (from: number, to: number) => void;
  children: ReactNode;
}
