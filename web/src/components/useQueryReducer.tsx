import {useReducer} from 'react';

type Filter = {[attribute: string]: {eq: string}};

interface RType {
  query: State;
  order: (by: string) => void;
  prev: () => void;
  next: () => void;
  setFilter: (by: Filter) => void;
  setLimit: (limit: number) => void;
}

type State = {filter?: Filter; order?: string; offset?: number; limit?: number};
type Action =
  | {type: 'setFilter'; by: Filter}
  | {type: 'prev'} // pagination
  | {type: 'next'} // pagination
  | {type: 'setLimit'; limit: number}
  | {type: 'order'; by: string};

export const useQueryReducer = (
  init: State = {offset: 0, limit: 10, filter: {}, order: ''},
): RType => {
  const reducer = (query: State, action: Action) => {
    switch (action.type) {
      case 'setFilter': {
        return {...query, filter: action.by || undefined};
      }
      case 'order': {
        return action.by ? {...query, order: action.by} : query;
      }
      case 'prev': {
        let offset = query.offset - query.limit;
        if (offset < 0) offset = 0;
        return {...query, offset};
      }
      case 'next': {
        return {...query, offset: query.offset + query.limit};
      }
      case 'setLimit': {
        let limit = action.limit;
        if (limit < 1) limit = 1;
        return {...query, limit};
      }
    }
  };

  const [query, dispatch] = useReducer(reducer, init);

  return {
    query,
    order: (by) => dispatch({type: 'order', by}),
    prev: () => dispatch({type: 'prev'}),
    next: () => dispatch({type: 'next'}),
    setFilter: (by) => dispatch({type: 'setFilter', by}),
    setLimit: (limit) => dispatch({type: 'setLimit', limit}),
  };
};
