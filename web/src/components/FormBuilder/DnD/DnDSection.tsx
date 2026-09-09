import React from 'react';
import {useDrop, DragElementWrapper} from 'react-dnd';
import {ItemTypes} from './ItemTypes';
import {DnDItem} from '../types';

type Props = {
  /** The id of the outermost component of the render prop */
  id?: string;
  /** A functino wich will be called if the component is hoverd.
   * @params item The hovering item
   */
  onHover?: (item: DnDItem) => void;
  /**
   * A function wich will be called if an item is droped inside this component.
   * The existence of this component will determine react-dnd .canDrop returns true / false
   * @param targetID  The id of the component the item is dropped in
   * @param item      The dropped item
   */
  onDrop?: (targetID: string, item: DnDItem) => void;
  /** A render prop
   * @param id    The id of the rendered component
   * @param drop  Set this as ref for the wrapper component that will be rendered
   */
  render: (targetID: string, drop: DragElementWrapper<any>) => React.ReactNode;
};

/** A generic wrapper for a component which should listen for react-dnd drop and hover events */
export const DnDSection: React.FC<Props> = ({
  id = '',
  onHover,
  onDrop,
  render,
}) => {
  const [, drop] = useDrop({
    accept: ItemTypes.FORM_FIELD,
    canDrop: () => !!onDrop,
    hover(item: DnDItem) {
      if (!onHover) return;
      onHover(item);
    },
    drop: (item: DnDItem) => {
      if (!onDrop) return;
      onDrop(id, item);
    },
  });

  return <>{render(id, drop)}</>;
};
