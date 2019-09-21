import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';

import { logger } from './common';

//- Actions
export const toggleColumnVisibility = createAction('COLUMN_VISIBILITY_TOGGLE');
export const moveColumn = createAction('COLUMN_MOVE');
export const setColumnWidth = createAction('COLUMN_WIDTH_SET');
export const setIsCompact = createAction('IS_COMPACT_SET');
export const setSelectedRowIndex = createAction('SELECTED_ROW_INDEX_SET');
export const setTemplateOfData = createAction('TEMPLATE_OF_DATA_SET');

/*
 * memberArr 和 replaceArr 都是 array of object
 * getObjId 以 object 为 param，返回 object 的唯一标识符 id
 * 返回的结果也是一个 array of object，以 memberArr 中的 obj 为准
 * 如果 replaceArr 中有相同 obj，则用其代替 memberArr 中的 obj
 */
function replaceObjectArr(memberArr, replaceArr, getObjId) {
  const replaceMap = replaceArr.reduce((result, obj) => {
    const objId = getObjId(obj);
    result[objId] = obj;
    return result;
  }, {})
  return memberArr.map((obj) => {
    const objId = getObjId(obj);
    if (objId in replaceMap) {
      return replaceMap[objId];
    } else {
      return obj;
    }
  })
}

export function genColumnsByFirstRow(firstRow) {
  const columns = [];
  for (let key of Object.keys(firstRow)) {
    columns.push({
      meta: {
        visible: true,
      },
      config: {
        title: key,
        dataIndex: key, 
      }
    });
  }
  return columns;
}

const demoData = [
  {
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    name: '胡彦祖',
    age: 42,
    // 这段超长的内容可以测试出很多有关 table 样式的 bug
    address: '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号',
  },
];
const demoRawInput = JSON.stringify(demoData, null, 2);
const demoColumns = genColumnsByFirstRow(demoData[0]);

export const initialState = {
  rawInput: demoRawInput,
  data: demoData,
  columns: demoColumns,
  lastValidColumns: demoColumns,
  height: 320,
  isCompact: false,
  selectedRowIndex: 0,
};

//- Reducers
export default handleActions({
  [setTemplateOfData]: (state, action) => {
    const INVALID_RAW_INPUT_ERR_MSG = `数据不合法。请输入一个 json array，其元素是 json object`;
    const evalResult = {
      code: 0,
      msg: 'ok',
      visible: true,
    }
    let newData = [];
    try {
      const obj = JSON.parse(action.payload);
      if (Array.isArray(obj)) {
        newData = obj;
      } else {
        evalResult.code = 101;
        evalResult.msg = INVALID_RAW_INPUT_ERR_MSG;
      }
    } catch (e) {
      evalResult.code = 102;
      evalResult.msg = INVALID_RAW_INPUT_ERR_MSG;
    }
    if (evalResult.code === 0) {
      let newColumns = [];
      if (newData.length > 0) {
        newColumns = replaceObjectArr(genColumnsByFirstRow(newData[0]), 
          state.lastValidColumns, 
          (obj) => obj.config.dataIndex,
        );
      }
      return {
        ...state,
        rawInput: action.payload,
        rawInputEvalResult: evalResult,
        data: newData,
        columns: newColumns,
        lastValidColumns: newColumns,
      }
    } else {
      return {
        ...state,
        rawInput: action.payload,
        rawInputEvalResult: evalResult,
        data: [],
        columns: [],
      }
    }
  },
  [toggleColumnVisibility]: (state, action) => {
    const columnIndex = action.payload;
    return produce(state, draft => {
      draft.columns[columnIndex].meta.visible = !draft.columns[columnIndex].meta.visible;
      draft.lastValidColumns = draft.columns;
    })
  },
  [moveColumn]: (state, action) => {
    const fromIndex = action.payload.from;
    const toIndex = action.payload.to;
    return produce(state, draft => {
      const from = state.columns[fromIndex];
      draft.columns.splice(fromIndex, 1);
      draft.columns.splice(toIndex, 0, from);
    })
  },
  [setColumnWidth]: (state, action) => {
    const { index, width } = action.payload;
    logger.debug(`in table reducer, setColumnWidth(index=${index}, width=${width})`);
    return produce(state, draft => {
      draft.columns[index].config.width = width;
    })
  },
  [setIsCompact]: (state, action) => {
    return produce(state, draft => {
      draft.isCompact = action.payload;
    })
  },
  [setSelectedRowIndex]: (state, action) => {
    return produce(state, draft => {
      draft.selectedRowIndex = action.payload;
    })
  },
}, initialState);

//- Selectors
// 用于构造计算模板结果时使用的 context，不包含模板项
export const getExportedStateNoTemplate = (state) => {
  const selectedRow = {
    index: state.selectedRowIndex,
  }
  if (state.data.length > selectedRow.index) {
    selectedRow.data = state.data[selectedRow.index];
  }
  
  return {
    data: state.data,
    selectedRow,
  }
}

// ModelBrowser 使用，组件公开的所有数据
export const getExportedState = (state) => (
  {
    ...getExportedStateNoTemplate(state),
  }
)