import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './Table.less';
import { 
  Icon, 
  Collapse,
  Table as AntTable,
} from "antd";
import Config from './Config';

// LATER(ruitao.xu): 单纯用 index 可能存在问题，比如两次 API 加载回来的数据第一行 key 都是 1，会导致 react 不更新数据
function genRowKey(record, index) {
  return index;
}

function Table({ data, columns }) {
  const classNames = [styles.widgetTable]

  return (
    <div className={classNames.join(' ')}>
      <AntTable bordered rowKey={genRowKey} dataSource={data} columns={columns} />
    </div>
  );
}

const Column = {
  propTypes: PropTypes.shape({
    title: PropTypes.string.isRequired,
    dataIndex: PropTypes.string.isRequired,
    // colSpan = 0，则该列数据不显示
    colSpan: PropTypes.number.isRequired,
  }),
}

Table.propTypes = {
  rawInput: PropTypes.string,
  rawInputEvalResult: PropTypes.shape(Config.LabelCmInput.EvalResult.propTypes),
  data: PropTypes.array,
  columns: PropTypes.arrayOf(Column.propTypes),
};

function genColumnsByFirstRow(firstRow) {
  const columns = [];
  for (let key of Object.keys(firstRow)) {
    columns.push({
      title: key,
      dataIndex: key,
      colSpan: 1,
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
    address: '西湖区湖底公园1号',
  },
];
const demoRawInput = JSON.stringify(demoData, null, 2);
const demoColumns = genColumnsByFirstRow(demoData[0]);
demoColumns[0].colSpan = 0;

function deepCopyObjectArray(objArr) {
  return objArr.map(entry => ({...entry}));
}

Table.defaultProps = {
  rawInput: demoRawInput,
  data: demoData,
  columns: demoColumns,
  lastValidColumns: deepCopyObjectArray(demoColumns),
};

/*
  merge two array, when primaryKey conflicts, take baseArr[primaryKey] as result
  baseArr: [
    {
      id: 1,
      k1: '1.v1',
      k2: '1.v2',
    },
    {
      id: 2,
      k1: '2.v1',
      k2: '2.v2',
    },
  ]
  newArr: [
    {
      id: 1,
      k1: '1.v1.modified',
      k2: '1.v2',
    },
    {
      id: 3,
      k1: '3.v1',
      k2: '3.v2',
    },
  ]

  return: [
    {
      id: 1,
      k1: '1.v1',
      k2: '1.v2',
    },
    {
      id: 3,
      k1: '3.v1',
      k2: '3.v2',
    },
  ]
*/
function mergeObjectArray(baseArr, newArr, primaryKey) {
  // TODO(ruitao.xu): impl
  return baseArr;
}

const initialState = Table.defaultProps;
const ACTION_TYPE = {
  SET_RAW_INPUT: 'setRawInput',
  TOGGLE_COLUMN_VISIBILITY: 'toggleColumnVisibility',
}
function reducer(prevState, action) {
  const INVALID_RAW_INPUT_ERR_MSG = `数据不合法。请输入一个 json array，其元素是 json object`;
  switch (action.type) {
    case ACTION_TYPE.SET_RAW_INPUT:
      const evalResult = {
        code: 0,
        msg: 'ok',
      }
      let data = null;
      try {
        const obj = JSON.parse(action.payload);
        if (Array.isArray(obj)) {
          data = obj;
        } else {
          evalResult.code = 101;
          evalResult.msg = INVALID_RAW_INPUT_ERR_MSG;
        }
      } catch (e) {
        evalResult.code = 102;
        evalResult.msg = INVALID_RAW_INPUT_ERR_MSG;
      }
      if (evalResult.code === 0) {
        let newColumns = null;
        if (data.length > 0) {
          newColumns = genColumnsByFirstRow(data[0]);
        }
        return {
          ...prevState,
          rawInput: action.payload,
          rawInputEvalResult: evalResult,
          data: data,
          columns: newColumns,
          lastValidColumns: mergeObjectArray(prevState.lastValidColumns, newColumns, 'dataIndex'),
        }
      } else {
        return {
          ...prevState,
          rawInput: action.payload,
          rawInputEvalResult: evalResult,
          data: null,
          columns: null,
        }
      }
    case ACTION_TYPE.TOGGLE_COLUMN_VISIBILITY:
      const columnIndex = action.payload;
      const newColumns = prevState.columns.map(entry => ({...entry}));
      newColumns[columnIndex].colSpan = 1 - newColumns[columnIndex].colSpan;
      return {
        ...prevState,
        columns: newColumns,
        lastValidColumns: deepCopyObjectArray(newColumns),
      }

    default:
      throw new Error(`in TableWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ColumnVisibilityIcon({visible, onClick}) {
  const type = visible ? 'eye' : 'eye-invisible';
  return <Icon type={type} onClick={onClick} />
}

function ConfigPanel({ rawInput, rawInputEvalResult, columns, dispatch }) {
  function onRawInputChange(newValue) {
    dispatch({
      type: ACTION_TYPE.SET_RAW_INPUT,
      payload: newValue,
    });
  }
  function onColumnVisibleChange(index, event) {
    dispatch({
      type: ACTION_TYPE.TOGGLE_COLUMN_VISIBILITY,
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
            onChange: onRawInputChange,
          }}
        />
      </Panel>
      <Panel header='列选项' key='2' >
        <Config.Label value='单列选项' />
        <Collapse
          defaultActiveKey={[]}
          expandIconPosition='right'
        >
          { 
            columns.map((column, index) => { 
              return (
              <Panel header={column.dataIndex} key={column.dataIndex} 
                extra={(
                  <ColumnVisibilityIcon 
                    visible={column.colSpan > 0}
                    onClick={(event) => onColumnVisibleChange(index, event)} 
                />)}
              >
              </Panel>
              );
            })
          }
        </Collapse>
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
