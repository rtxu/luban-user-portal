import alasql from 'alasql';
import isEqual from 'lodash.isequal';
import { createAction, handleActions } from 'redux-actions';

import { createLogger } from '../../../util';
import { TemplateTypeEnum } from '../../../util/template';

const logger = createLogger('/pages/editor/models/operations');

enum OpTypeEnum {
  SQLReadonly = 'SQLReadonly',
  SQLReadWrite = 'SQLReadWrite',
}
enum ExecModeEnum {
  Manual = 'Manual',
  // auto exec when prepared sql tempalte changed
  Auto = 'Auto',
}

// Actions
export const initOperations = createAction('OPERATIONS_INIT');
export const addOperation = createAction('OPERATION_ADD');
export const deleteOperation = createAction('OPERATION_DELETE');
export const setPreparedSqlTemplateInput = createAction('OPERATION_PREPARED_SQL_TEMPLATE_INPUT_SET');
export const evalPreparedSqlTemplate = createAction('OPERATION_PREPARED_SQL_TEMPLATE_INPUT_EVAL');
export const setOperationType = createAction('OPERATION_TYPE_SET');
export const setOperationOpListWhenSuccess = createAction('OPERATION_OP_LIST_WHEN_SUCCESS_SET');
export const setOperationOpListWhenFail = createAction('OPERATION_OP_LIST_WHEN_FAIL_SET');
const execOperationFail = createAction('OPERATION_EXEC_FAIL');
const execOperationSuccess = createAction('OPERATION_EXEC_SUCCESS');

// Effects
export const execOperation = createAction('OPERATION_EXEC');
export const evalAndExecIfNeeded = createAction('OPERATION_EVAL_AND_EXEC_IF_NEEDED');

// initial state
export const initialState = {};
const singleOperationInitialState = {
  type: OpTypeEnum.SQLReadonly,
  // preparedSqlTemplate
  preparedSqlInput: '',
  preparedSql: null,
  preparedSqlError: null,

  execMode: ExecModeEnum.Auto,
  /** exec result */
  data: null,
  lastExecSql: null,
  error: null,

  opListWhenSuccess: [],
  opListWhenFail: [],
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
      preparedSqlInput: action.payload.input,
    }
  },
  [`${NS}/${evalPreparedSqlTemplate}`]: (state, action) => {
    const { value, error } = action.payload;
    return {
      ...state,
      preparedSql: value,
      preparedSqlError: error ? `${error.name}: ${error.message}`: null,
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
  [`${NS}/${setOperationType}`]: (state, action) => {
    return {
      ...state,
      type: action.payload.type,
    }
  },
  [`${NS}/${setOperationOpListWhenSuccess}`]: (state, action) => {
    return {
      ...state,
      opListWhenSuccess: action.payload.list,
    }
  },
  [`${NS}/${setOperationOpListWhenFail}`]: (state, action) => {
    return {
      ...state,
      opListWhenFail: action.payload.list,
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
      const sql = op.preparedSql;
      if (op.preparedSqlError || op.preparedSqlInput === '') {
        // nothing to do
      } else {
        try {
          // console.log('===> exec', sql.sqlTemplate, sql.params);
          const data = yield call(alasql.promise, sql.sqlTemplate, sql.params);
          // console.log('===> exec result', data);
          yield put({
            type: execOperationSuccess.toString(),
            payload: { id, data, sql },
          });
          if (op.opListWhenSuccess) {
            for (const opId of op.opListWhenSuccess) {
              yield put({
                type: execOperation.toString(),
                payload: { id: opId },
              });
            }
          }
        } catch (e) {
          yield put({
            type: execOperationFail.toString(),
            payload: {
              id,
              error: `${e.name}: ${e.message}`,
            },
          });
          if (op.opListWhenFail) {
            for (const opId of op.opListWhenFail) {
              yield put({
                type: execOperation.toString(),
                payload: { id: opId },
              });
            }
          }
        }
      }
    },
    *[evalAndExecIfNeeded](action, sagaEffects) {
      const { put, select } = sagaEffects;
      const { id, value, error } = action.payload;
      yield put({
        type: evalPreparedSqlTemplate.toString(),
        payload: action.payload, 
      });
      
      if (error) {
        // do nothing
      } else {
        const op = yield select(state => state.operations[id]);
        if (op.execMode === ExecModeEnum.Auto) {
          if (isEqual(op.lastExecSql, value)) {
            // do nothing
          } else {
            // auto exec when sql changed
            yield put({
              type: execOperation.toString(),
              payload: { id: op.id, },
            });
          }
        }
      }

    },
  },
  reducers: {
    [initOperations]: (state, action) => {
      return action.payload;
    },
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
    [setOperationType]: defaultActionHandler,
    [setOperationOpListWhenSuccess]: defaultActionHandler,
    [setOperationOpListWhenFail]: defaultActionHandler,
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
      input: op.preparedSqlInput,
      onEvalActionCreator: (value, extra, error) => ({
        type: `${NS}/${evalAndExecIfNeeded}`,
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
  preparedSql: op.preparedSql,
})

export const getExportedState = (operations) => {
  const exported = {};
  for (const [opId, op] of Object.entries(operations)) {
    exported[opId] = getOpExportedState(op);
  }
  return exported;
}