import {useCallback, useRef} from 'react';
import {DnDItem} from './types';
import {useFormFields} from './useFormFields';
import {randString} from './utils';

interface RType {
  formFields: ReturnType<typeof useFormFields>;
  onOutsideHover: (item: DnDItem) => void;
  onDrop: () => string | null;
}

export const useFormBuilder = (init: DnDItem[] = []): RType => {
  const formFields = useFormFields(init);

  /**
   *  Holds the idea of the currently dragged new Item from the DnDSourceSection.
   *  This is used to be able to remove the item if it moves outside the actual Formsection.
   *  The default value is null. Only if a new item is added and currently dragged, this ref
   *  will hold the coresponding id. To avoid weird behaviour this must be set back to null
   *  once the item is dropped. Otherwise the newest item will be removed if it is dragged outside after the
   *  inital drop.
   */
  const currNewItemId = useRef<null | string>(null);

  const _insert = useCallback((item: DnDItem, index: number) => {
    item.id = randString();
    formFields.insert(item, index);
    currNewItemId.current = item.id;
    return item.id;
  }, []);

  const _duplicate = useCallback((id: string) => {
    formFields.duplicate(id);
    currNewItemId.current = null;
  }, []);

  /**
   *  If the DnDSource item drops this handler will be called.
   *  It resets the currentNewItemId in order to avoid following scenario:
   *  Source item drops in form section, will be redragged outside the form section and
   *  filtered out in the onOutsideHover handler.
   */
  const onDrop = () => {
    if (!currNewItemId.current) return;
    const tmp = currNewItemId.current;
    currNewItemId.current = null;
    return tmp;
  };

  const onOutsideHover = (item: DnDItem) => {
    if (!currNewItemId.current) return;
    formFields.delete(currNewItemId.current);
    item.rowIndex = -1;
    currNewItemId.current = null;
  };

  return {
    formFields: {...formFields, insert: _insert, duplicate: _duplicate},
    onOutsideHover,
    onDrop,
  };
};
