import alasql from 'alasql';
import isEqual from 'lodash.isequal';
import { createAction, handleActions } from 'redux-actions';

import { createLogger } from '../../../util';
import { TemplateTypeEnum } from '../../../util/template';

const logger = createLogger('/pages/editor/models/operations');

const OP_TYPE = Object.freeze({
  SQLReadonly: 'SQLReadonly',
});

// Actions
export const addOperation = createAction('OPERATION_ADD');
export const deleteOperation = createAction('OPERATION_DELETE');
export const setPreparedSqlTemplateInput = createAction('OPERATION_PREPARED_SQL_TEMPLATE_INPUT_SET');
export const evalPreparedSqlTemplate = createAction('OPERATION_PREPARED_SQL_TEMPLATE_INPUT_EVAL');
export const execOperation = createAction('OPERATION_EXEC');
export const execOperationFail = createAction('OPERATION_EXEC_FAIL');
export const execOperationSuccess = createAction('OPERATION_EXEC_SUCCESS');

// initial state
const initialState = {};
const singleOperationInitialState = {
  type: OP_TYPE.SQLReadonly,
  preparedSqlTemplate: {
    input: '',
    value: null,
    error: null,
  },
  /** exec result */
  data: null,
  lastExecSql: null,
  error: null,
}

// Reducers
// single operation
const NS = 'operations';
const operation = handleActions({
  [`${NS}/${addOperation}`]: (state, action) => {
    return {
      id: action.payload.id,
      ...singleOperationInitialState,
    }
  },
  [`${NS}/${setPreparedSqlTemplateInput}`]: (state, action) => {
    return {
      ...state,
      preparedSqlTemplate: {
        ...state.preparedSqlTemplate,
        input: action.payload.input,
      },
    }
  },
  [`${NS}/${evalPreparedSqlTemplate}`]: (state, action) => {
    const { value, error } = action.payload;
    return {
      ...state,
      preparedSqlTemplate: {
        ...state.preparedSqlTemplate,
        value,
        error: error ? `${error.name}: ${error.message}`: null,
      },
    }
  },
  [`${NS}/${execOperationFail}`]: (state, action) => {
    const { error } = action.payload;
    return {
      ...state,
      error,
    }
  },
  [`${NS}/${execOperationSuccess}`]: (state, action) => {
    const { data, sql } = action.payload;
    return {
      ...state,
      data,
      lastExecSql: sql,
    }
  },
}, {})

// operation map
const defaultActionHandler = (state, action) => {
  const { id } = action.payload;
  return {
    ...state,
    [id]: operation(state[id], action),
  }
}
export default {
  state: initialState,
  effects: {
    *[execOperation](action, sagaEffects) {
      const { call, put, select } = sagaEffects;
      const { id } = action.payload;
      const op = yield select(state => state.operations[id]);
      const tmpl = op.preparedSqlTemplate;
      const sql = tmpl.value;
      if (tmpl.error || tmpl.input === '' || isEqual(sql, op.lastExecSql)) {
        // nothing to do
      } else {
        try {
          const data = yield call(alasql.promise, sql.sqlTemplate, sql.params);
          yield put({
            type: execOperationSuccess.toString(),
            payload: { id, data, sql },
          });
        } catch (e) {
          yield put({
            type: execOperationFail.toString(),
            payload: {
              id,
              error: `${e.name}: ${e.message}`,
            },
          });
        }
      }
    },
  },
  reducers: {
    [addOperation]: defaultActionHandler,
    [deleteOperation]: (state, action) => {
      const toDeleteId = action.payload;
      return Object.keys(state).filter((id) => id !== toDeleteId)
        .reduce((newOperations, id) => {
          newOperations[id] = state[id]
          return newOperations
        }, {})
    },
    [setPreparedSqlTemplateInput]: defaultActionHandler,
    [evalPreparedSqlTemplate]: defaultActionHandler,
    [execOperationFail]: defaultActionHandler,
    [execOperationSuccess]: defaultActionHandler,
  },
};

// Selectors
export const getToEvalTemplates = (operations) => {
  const opTemplates = Object.keys(operations).map((opId) => {
    const op = operations[opId];
    return {
      /** templateId */
      id: `${opId}.preparedSql`,
      type: TemplateTypeEnum.Alasql, 
      input: op.preparedSqlTemplate.input,
      onEvalActionCreator: (value, extra, error) => ({
        type: `${NS}/${evalPreparedSqlTemplate}`,
        payload: {
          /** id used to locate op in `operations` */
          id: opId,
          value,
          error,
        },
      }),
    }
  })

  return opTemplates
}

const getRawExportedState = (op) => ({
  data: op.data,
})

export const getEvalContext = (operations) => {
  const exported = {};
  for (const [opId, op] of Object.entries(operations)) {
    exported[opId] = getRawExportedState(op);
  }
  return exported;
}

const getOpExportedState = (op) => ({
  data: op.data,
  preparedSql: op.preparedSqlTemplate.value,
})

export const getExportedState = (operations) => {
  const exported = {};
  for (const [opId, op] of Object.entries(operations)) {
    exported[opId] = getOpExportedState(op);
  }
  return exported;
}