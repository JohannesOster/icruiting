import React, {useEffect, useRef} from 'react';
import {useDrag} from 'react-dnd';
import {DnDItem} from '../types';
import styled from 'styled-components';

const Item = styled.div`
  padding: ${({theme}) => `${theme.spacing.scale200} ${theme.spacing.scale200}`};
  background: ${({theme}) => theme.colors.surfaceSubdued};
  box-shadow: ${({theme}) => theme.shadows.card};
  display: flex;
  gap: ${({theme}) => theme.spacing.scale200};
  align-items: center;
  cursor: move;
`;

type Props = {
  item: DnDItem;
  children?: React.ReactNode;
};

/** A dragable component which acts as a source for the dnd-form builder  */
export const DnDSourceItem: React.FC<Props> = ({item: sourceItem, ...props}) => {
  const {icon, label, ...item} = sourceItem; // ignore icon and title parameters of DnDSourceItem
  const ref = useRef<HTMLDivElement>(null);
  const [{isDragging}, drag] = useDrag({
    item,
    options: {dropEffect: 'copy'},
    collect: (monitor) => ({isDragging: monitor.isDragging()}),
  });

  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [drag]);

  return <Item ref={ref} style={{opacity: isDragging ? 0.5 : 1}} {...props} />;
};
