import alasql from "alasql";
import isEqual from "lodash.isequal";
import { Action, createAction, handleActions } from "redux-actions";

import { ErrorT, TemplateTypeEnum } from "../../../util/template";

enum OpTypeEnum {
  SQLReadonly = "SQLReadonly",
  SQLReadWrite = "SQLReadWrite"
}
enum ExecModeEnum {
  Manual = "Manual",
  // auto exec when prepared sql tempalte changed
  Auto = "Auto"
}

interface IOperation {
  id: string;
  [propName: string]: any;
}

// Actions
const NS = "operations";
const addOperationType = "OPERATION_ADD";
const addOperationTypeNs = `${NS}/${addOperationType}`;
export const addOperation = createAction<{ id: string }>(addOperationTypeNs);
const deleteOperationType = "OPERATION_DELETE";
const deleteOperationTypeNs = `${NS}/${deleteOperationType}`;
export const deleteOperation = createAction<string>(deleteOperationTypeNs);
const initOperationsType = "OPERATIONS_INIT";
const initOperationsTypeNS = `${NS}/${initOperationsType}`;
export const initOperations = createAction<{ [key: string]: IOperation }>(
  initOperationsTypeNS
);
const setPreparedSqlTemplateInputType =
  "OPERATION_PREPARED_SQL_TEMPLATE_INPUT_SET";
const setPreparedSqlTemplateInputTypeNs = `${NS}/${setPreparedSqlTemplateInputType}`;
export const setPreparedSqlTemplateInput = createAction<{
  id: string;
  input: string;
}>(setPreparedSqlTemplateInputTypeNs);
const evalPreparedSqlTemplateType =
  "OPERATION_PREPARED_SQL_TEMPLATE_INPUT_EVAL";
const evalPreparedSqlTemplateTypeNs = `${NS}/${evalPreparedSqlTemplateType}`;
const evalPreparedSqlTemplateLocal = createAction<{
  id: string;
  value: string;
  error: ErrorT;
}>(evalPreparedSqlTemplateType);
export const evalPreparedSqlTemplate = createAction<{
  id: string;
  value: string;
  error: ErrorT;
}>(evalPreparedSqlTemplateTypeNs);
const setOperationTypeType = "OPERATION_TYPE_SET";
const setOperationTypeTypeNs = `${NS}/${setOperationTypeType}`;
export const setOperationType = createAction<{ id: string; type: OpTypeEnum }>(
  setOperationTypeTypeNs
);
const setOperationOpListWhenSuccessType = "OPERATION_OP_LIST_WHEN_SUCCESS_SET";
const setOperationOpListWhenSuccessTypeNs = `${NS}/${setOperationOpListWhenSuccessType}`;
export const setOperationOpListWhenSuccess = createAction<{
  id: string;
  list: string[];
}>(setOperationOpListWhenSuccessTypeNs);
const setOperationOpListWhenFailType = "OPERATION_OP_LIST_WHEN_FAIL_SET";
const setOperationOpListWhenFailTypeNs = `${NS}/${setOperationOpListWhenFailType}`;
export const setOperationOpListWhenFail = createAction<{
  id: string;
  list: string[];
}>(setOperationOpListWhenFailTypeNs);
const execOperationFailType = "OPERATION_EXEC_FAIL";
const execOperationFailTypeNs = `${NS}/${execOperationFailType}`;
const execOperationFailLocal = createAction<{ id: string; error: string }>(
  execOperationFailType
);
export const execOperationFail = createAction<{ id: string; error: string }>(
  execOperationFailTypeNs
);
const execOperationSuccessType = "OPERATION_EXEC_SUCCESS";
const execOperationSuccessTypeNs = `${NS}/${execOperationSuccessType}`;
const execOperationSuccessLocal = createAction<{
  id: string;
  data: any;
  sql: { sqlTempalte: string; params: any[] };
}>(execOperationSuccessType);
export const execOperationSuccess = createAction<{
  id: string;
  data: any;
  sql: { sqlTempalte: string; params: any[] };
}>(execOperationSuccessTypeNs);

// Effects
const execOperationType = "OPERATION_EXEC";
const execOperationTypeNs = `${NS}/${execOperationType}`;
const execOperationLocal = createAction<{ id: string }>(execOperationType);
export const execOperation = createAction<{ id: string }>(execOperationTypeNs);
const evalAndExecIfNeededType = "OPERATION_EVAL_AND_EXEC_IF_NEEDED";
const evalAndExecIfNeededTypeNs = `${NS}/${evalAndExecIfNeededType}`;
export const evalAndExecIfNeeded = createAction<{
  id: string;
  value: any;
  error: ErrorT;
}>(evalAndExecIfNeededTypeNs);

// initial state
export const initialState = {};
const singleOperationInitialState = {
  type: OpTypeEnum.SQLReadonly,
  // preparedSqlTemplate
  preparedSqlInput: "",
  preparedSql: null,
  preparedSqlError: null,

  execMode: ExecModeEnum.Auto,
  /** exec result */
  data: null,
  lastExecSql: null,
  error: null,

  opListWhenSuccess: [],
  opListWhenFail: []
};

// Reducers
// single operation
const operation = handleActions(
  {
    [addOperationTypeNs]: (state, action: Action<{ id: string }>) => {
      return {
        id: action.payload.id,
        ...singleOperationInitialState
      };
    },
    [setPreparedSqlTemplateInputTypeNs]: (
      state,
      action: Action<{ input: string }>
    ) => {
      return {
        ...state,
        preparedSqlInput: action.payload.input
      };
    },
    [evalPreparedSqlTemplateTypeNs]: (
      state,
      action: Action<{ value: string; error: ErrorT }>
    ) => {
      const { value, error } = action.payload;
      return {
        ...state,
        preparedSql: value,
        preparedSqlError: error ? `${error.name}: ${error.message}` : null
      };
    },
    [execOperationFailTypeNs]: (state, action: Action<{ error: string }>) => {
      const { error } = action.payload;
      return {
        ...state,
        error
      };
    },
    [execOperationSuccessTypeNs]: (
      state,
      action: Action<{ data: any; sql: { sqlTemplate: string; params: any[] } }>
    ) => {
      const { data, sql } = action.payload;
      return {
        ...state,
        data,
        lastExecSql: sql
      };
    },
    [setOperationTypeTypeNs]: (state, action: Action<{ type: OpTypeEnum }>) => {
      return {
        ...state,
        type: action.payload.type
      };
    },
    [setOperationOpListWhenSuccessTypeNs]: (
      state,
      action: Action<{ list: string[] }>
    ) => {
      return {
        ...state,
        opListWhenSuccess: action.payload.list
      };
    },
    [setOperationOpListWhenFailTypeNs]: (
      state,
      action: Action<{ list: string[] }>
    ) => {
      return {
        ...state,
        opListWhenFail: action.payload.list
      };
    }
  },
  {}
);

// operation map
const defaultActionHandler = (state, action: Action<{ id: string }>) => {
  const { id } = action.payload;
  return {
    ...state,
    [id]: operation(state[id], action)
  };
};
export default {
  state: initialState,
  effects: {
    *[execOperationType](action: Action<{ id: string }>, sagaEffects) {
      const { call, put, select } = sagaEffects;
      const { id } = action.payload;
      const op = yield select(state => state.operations[id]);
      const sql = op.preparedSql;
      if (op.preparedSqlError || op.preparedSqlInput === "") {
        // nothing to do
      } else {
        try {
          // console.log('===> exec', sql.sqlTemplate, sql.params);
          const data = yield call(alasql.promise, sql.sqlTemplate, sql.params);
          // console.log('===> exec result', data);
          yield put(execOperationSuccessLocal({ id, data, sql }));
          if (op.opListWhenSuccess) {
            for (const opId of op.opListWhenSuccess) {
              yield put(execOperationLocal({ id: opId }));
            }
          }
        } catch (e) {
          yield put(
            execOperationFailLocal({
              id,
              error: `${e.name}: ${e.message}`
            })
          );
          if (op.opListWhenFail) {
            for (const opId of op.opListWhenFail) {
              yield put(execOperationLocal({ id: opId }));
            }
          }
        }
      }
    },
    *[evalAndExecIfNeededType](action, sagaEffects) {
      const { put, select } = sagaEffects;
      const { id, value, error } = action.payload;
      yield put(evalPreparedSqlTemplateLocal(action.payload));

      if (error) {
        // do nothing
      } else {
        const op = yield select(state => state.operations[id]);
        if (op.execMode === ExecModeEnum.Auto) {
          if (isEqual(op.lastExecSql, value)) {
            // do nothing
          } else {
            // auto exec when sql changed
            yield put(execOperationLocal({ id: op.id }));
          }
        }
      }
    }
  },
  reducers: {
    [initOperationsType]: (state, action) => {
      return action.payload;
    },
    [addOperationType]: defaultActionHandler,
    [deleteOperationType]: (state, action: Action<string>) => {
      const toDeleteId = action.payload;
      return Object.keys(state)
        .filter(id => id !== toDeleteId)
        .reduce((newOperations, id) => {
          newOperations[id] = state[id];
          return newOperations;
        }, {});
    },
    [setPreparedSqlTemplateInputType]: defaultActionHandler,
    [evalPreparedSqlTemplateType]: defaultActionHandler,
    [execOperationFailType]: defaultActionHandler,
    [execOperationSuccessType]: defaultActionHandler,
    [setOperationTypeType]: defaultActionHandler,
    [setOperationOpListWhenSuccessType]: defaultActionHandler,
    [setOperationOpListWhenFailType]: defaultActionHandler
  }
};

// Selectors
export const getToEvalTemplates = operations => {
  const opTemplates = Object.keys(operations).map(opId => {
    const op = operations[opId];
    return {
      /** templateId */
      id: `${opId}.preparedSql`,
      type: TemplateTypeEnum.Alasql,
      input: op.preparedSqlInput,
      onEvalActionCreator: (value, extra, error) =>
        evalAndExecIfNeeded({
          /** id used to locate op in `operations` */
          id: opId,
          value,
          error
        })
    };
  });

  return opTemplates;
};

const getRawExportedState = op => ({
  data: op.data
});

export const getEvalContext = operations => {
  const exported = {};
  for (const [opId, op] of Object.entries(operations)) {
    exported[opId] = getRawExportedState(op);
  }
  return exported;
};

const getOpExportedState = op => ({
  data: op.data,
  preparedSql: op.preparedSql
});

export const getExportedState = operations => {
  const exported = {};
  for (const [opId, op] of Object.entries(operations)) {
    exported[opId] = getOpExportedState(op);
  }
  return exported;
};
