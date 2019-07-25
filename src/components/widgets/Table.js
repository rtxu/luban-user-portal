import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './Table.less';
import { 
  Icon, 
  Collapse,
  Table as AntTable,
} from "antd";
import Config from './Config';
import produce from 'immer';

// LATER(ruitao.xu): 单纯用 index 可能存在问题，比如两次 API 加载回来的数据第一行 key 都是 1，会导致 react 不更新数据
function genRowKey(record, index) {
  return index;
}

function display(data, columns) {
  const displayColumns = columns.filter(column => column.meta.visible).map(column => column.config);
  const displayData = data.map(record => {
    return displayColumns.reduce((newRecord, column) => {
      newRecord[column.dataIndex] = record[column.dataIndex];
      return newRecord;
    }, {})
  });
  return [displayData, displayColumns];
}

function Table({ data, columns }) {
  const classNames = [styles.widgetTable]
  const [displayData, displayColumns] = display(data, columns);

  return (
    <div className={classNames.join(' ')}>
      <AntTable rowKey={genRowKey} dataSource={displayData} columns={displayColumns}
        bordered
        // TODO(ruitao.xu): scroll 可有效限制表格 width(x) 和 height(y)，需要根据父容器大小进行配置，以达到限定宽高的目的
        // 360 是 debugger 的默认高度，24 是 debugger 的默认 padding
        // y 仅负责限定 table body 的高度
        // 75 是 table header 的高度，32 是 pagination 的高度
        // 将 y 设置成 100% 并不能达到限定宽高的目的，不知道 why
        scroll={{x: '100%', y: 360-2*24-75-32}}
      />
    </div>
  );
}

const ColumnMeta = {
  propTypes: {
    visible: PropTypes.bool
  },
  defaultProps: {
    visible: true,
  },
}

// used by antd/Table
const ColumnConfig = {
  propTypes: {
    title: PropTypes.string.isRequired,
    dataIndex: PropTypes.string.isRequired,
  },
}

const Column = {
  propTypes: {
    meta: PropTypes.shape(ColumnMeta.propTypes),
    config: PropTypes.shape(ColumnConfig.propTypes),
  },
  defaultProps: {
    meta: ColumnMeta.defaultProps,
  }
}

Table.propTypes = {
  rawInput: PropTypes.string,
  rawInputEvalResult: PropTypes.shape(Config.LabelCmInput.EvalResult.propTypes),
  data: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(PropTypes.shape(Column.propTypes)),
  lastValidColumns: PropTypes.arrayOf(PropTypes.shape(Column.propTypes)),
};

function genColumnsByFirstRow(firstRow) {
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

Table.defaultProps = {
  rawInput: demoRawInput,
  data: demoData,
  columns: demoColumns,
  lastValidColumns: demoColumns,
};

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

const initialState = Table.defaultProps;
const ACTION_TYPE = {
  setRawInput: Symbol(),
  toggleColumnVisibility: Symbol(),
  showEvalResult: Symbol(),
  hideEvalResult: Symbol(),
}
function reducer(prevState, action) {
  switch (action.type) {
    case ACTION_TYPE.setRawInput:
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
            prevState.lastValidColumns, 
            (obj) => obj.config.dataIndex,
          );
        }
        return {
          ...prevState,
          rawInput: action.payload,
          rawInputEvalResult: evalResult,
          data: newData,
          columns: newColumns,
          lastValidColumns: newColumns,
        }
      } else {
        return {
          ...prevState,
          rawInput: action.payload,
          rawInputEvalResult: evalResult,
          data: [],
          columns: [],
        }
      }
    case ACTION_TYPE.toggleColumnVisibility:
      const columnIndex = action.payload;
      return produce(prevState, draft => {
        draft.columns[columnIndex].meta.visible = !draft.columns[columnIndex].meta.visible;
        draft.lastValidColumns = draft.columns;
      })
    case ACTION_TYPE.showEvalResult:
      return produce(prevState, draft => {
        if (draft.rawInputEvalResult) {
          draft.rawInputEvalResult.visible = true;
        }
      })
    case ACTION_TYPE.hideEvalResult:
      return produce(prevState, draft => {
        if (draft.rawInputEvalResult) {
          draft.rawInputEvalResult.visible = false;
        }
      })

    default:
      throw new Error(`in TableWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ColumnVisibilityIcon({visible, onClick}) {
  const type = visible ? 'eye' : 'eye-invisible';
  return <Icon type={type} onClick={onClick} />
}

function ConfigPanel({ rawInput, rawInputEvalResult, columns, dispatch }) {
  function setRawInput(editor, data, newValue) {
    dispatch({
      type: ACTION_TYPE.setRawInput,
      payload: newValue,
    });
  }
  function showEvalResult() {
    dispatch({
      type: ACTION_TYPE.showEvalResult,
    });
  }
  function hideEvalResult() {
    dispatch({
      type: ACTION_TYPE.hideEvalResult,
    });
  }
  function toggleColumnVisibility(index, event) {
    dispatch({
      type: ACTION_TYPE.toggleColumnVisibility,
      payload: index,
    });
    event.stopPropagation();
  }

  const { Panel } = Collapse;

  return (
    <Collapse
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='right'
    >
      <Panel header='内容' key='1' >
        <Config.LabelCmInput 
          label={{ value: '数据', }}
          input={{ 
            value: rawInput, 
            evalResult: rawInputEvalResult,
            // ref: https://github.com/scniro/react-codemirror2
            onBeforeChange: setRawInput,
            onBlur: hideEvalResult,
            onCursor: showEvalResult,
          }}
        />
      </Panel>
      <Panel header='列选项' key='2' >
        <Config.Label value='单列选项' />
        <div className={styles.override} >
          <Collapse
            defaultActiveKey={[]}
            expandIconPosition='left'
          >
            { 
              columns.map((column, index) => { 
                const conf = column.config;
                return (
                  <Panel header={conf.dataIndex} key={conf.dataIndex} showArrow={false} 
                    extra={(
                      <ColumnVisibilityIcon 
                        visible={column.meta.visible}
                        onClick={(event) => toggleColumnVisibility(index, event)} 
                      />)}
                  >
                  </Panel>
                );
              })
            }
          </Collapse>
        </div>
      </Panel>
      <Panel header='显示选项' key='3' >
      </Panel>
    </Collapse>
  );
}

ConfigPanel.propTypes = {
  ...Table.PropTypes,
  dispatch: PropTypes.func.isRequired,
}
Table.ConfigPanel = ConfigPanel;
Table.initialState = initialState;
Table.reducer = reducer;

Table.use = () => {
  const [widgetProps, widgetDispatch] = useReducer(Table.reducer, Table.initialState);
  return ([<Table {...widgetProps} />, 
    widgetProps, 
  <Table.ConfigPanel dispatch={widgetDispatch} {...widgetProps} />]);
}

export default Table;
