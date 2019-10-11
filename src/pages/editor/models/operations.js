import { createAction, handleActions } from 'redux-actions';

import { createLogger } from '@/util';

const logger = createLogger('/pages/editor/models/operations');

const OP_TYPE = Object.freeze({
  SQLReadonly: 'SQLReadonly',
});

//- Actions
export const addOperation = createAction('OPERATION_ADD');
export const deleteOperation = createAction('OPERATION_DELETE');
export const setOperationInput = createAction('OPERATION_INPUT_SET');
export const setOperationData = createAction('OPERATION_DATA_SET');

//- initial state
const initialState = {};
const defaultOpType = OP_TYPE.SQLReadonly;

//- Reducers
// single operation
const NS = 'operations';
const operation = handleActions({
  [`${NS}/${addOperation}`]: (state, action) => {
    console.log('add action in single reducer', action);
    return {
      id: action.payload.id,
      type: defaultOpType,
    }
  },
  [`${NS}/${setOperationInput}`]: (state, action) => {
    return {
      ...state,
      input: action.payload.input,
    }
  },
  [`${NS}/${setOperationData}`]: (state, action) => {
    return {
      ...state,
      data: action.payload.data,
    }
  },
}, {})

// operation map
export default {
  state: initialState,
  effects: {
  },
  reducers: {
    [addOperation]: (state, action) => {
      console.log('in operations reducer', action);
      const { id } = action.payload;
      return {
        ...state,
        [id]: operation(undefined, action),
      }
    },
    [deleteOperation]: (state, action) => {
      const toDeleteId = action.payload;
      return Object.keys(state).filter((id) => id !== toDeleteId)
        .reduce((newOperations, id) => {
          newOperations[id] = state[id]
          return newOperations
        }, {})
    },
    [setOperationInput]: (state, action) => {
      const { id } = action.payload;
      return {
        ...state,
        [id]: operation(state[id], action),
      }
    },
    [setOperationData]: (state, action) => {
      const { id } = action.payload;
      return {
        ...state,
        [id]: operation(state[id], action),
      }
    },
  },
};

//- Selectors