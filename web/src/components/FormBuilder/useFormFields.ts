import {useReducer} from 'react';
import {DnDItem} from './types';
import {arrInsert, arrMove} from 'utils/arrUtils';
import {randString} from './utils';

interface RType {
  fields: DnDItem[];
  move: (dragIndex: number, hoverIndex: number) => void;
  insert: (item: DnDItem, index: number) => void;
  delete: (id: string) => void;
  edit: (id: string, values: {[key: string]: string}) => void;
  duplicate: (id: string) => void;
  reset: (formFields: DnDItem[]) => void;
}

type State = DnDItem[];
type Action =
  | {type: 'move'; from: number; to: number}
  | {type: 'insert'; field: DnDItem; index: number}
  | {type: 'duplicate'; id: string}
  | {type: 'delete'; id: string}
  | {type: 'edit'; id: string; values: {[key: string]: string}}
  | {type: 'reset'; formFields: DnDItem[]};

export const useFormFields = (init: DnDItem[] = []): RType => {
  const reducer = (formFields: State, action: Action) => {
    switch (action.type) {
      case 'move': {
        return _move(formFields, action.from, action.to);
      }
      case 'insert': {
        return _insert(formFields, action.field, action.index);
      }
      case 'duplicate': {
        return _duplicate(formFields, action.id);
      }
      case 'delete': {
        return _delete(formFields, action.id);
      }
      case 'edit': {
        return _edit(formFields, action.id, action.values);
      }
      case 'reset': {
        return action.formFields;
      }
    }
  };

  /**
   * Helper function to reasign the array index of a formField to its internal formField.
   * This might be used as a param for a .map function after reordering the formFields.
   */
  const assignRowIndex = (field: DnDItem, index: number) => {
    field.rowIndex = index;
    return field;
  };

  const _move = (formFields: DnDItem[], from: number, to: number) => {
    return arrMove(formFields, from, to).map(assignRowIndex);
  };

  const _insert = (formFields: DnDItem[], field: DnDItem, index) => {
    const tmp = {
      id: field.id,
      type: field.type,
      rowIndex: index,
      component: field.component,
      as: field.as,
      props: {...field.props, name: randString()}, // otherwise reference is passed and next source items would point on same properties
      deletable: true,
      editable: true,
    };

    return arrInsert(formFields, tmp, index).map(assignRowIndex);
  };

  const _duplicate = (formFields: DnDItem[], id: string) => {
    const original = formFields.find((item) => item.id === id);
    if (!original) return;

    const duplicate = {...original, id: randString(), index: -1};
    delete duplicate.formFieldId;

    return _insert(formFields, duplicate, original.rowIndex + 1);
  };

  const _delete = (formFields: DnDItem[], id: string) => {
    return formFields.filter((item) => item.id !== id).map(assignRowIndex);
  };

  const _edit = (
    formFields: DnDItem[],
    id: string,
    values: {[key: string]: string},
  ) => {
    return formFields.map((item) => {
      if (item.id !== id) return item;
      Object.keys(values).forEach((key) => {
        item.props[key] = values[key];
      });

      return item;
    });
  };

  const [formFields, dispatch] = useReducer(reducer, init);

  return {
    fields: formFields,
    move: (from, to) => dispatch({type: 'move', from, to}),
    insert: (field, index) => dispatch({type: 'insert', field, index}),
    edit: (id, values) => dispatch({type: 'edit', id, values}),
    delete: (id) => dispatch({type: 'delete', id}),
    duplicate: (id) => dispatch({type: 'duplicate', id}),
    reset: (formFields) => dispatch({type: 'reset', formFields}),
  };
};
