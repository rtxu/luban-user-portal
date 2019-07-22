import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './Table.less';
import { 
  Collapse,
  Table as AntTable,
} from "antd";
import Config from './Config';

// LATER(ruitao.xu): 单纯用 index 可能存在问题，比如两次 API 加载回来的数据第一行 key 都是 1，会导致 react 不更新数据
function genRowKey(record, index) {
  return index;
}

function genColumnsByFirstRow(firstRow) {
  const columns = [];
  for (let key of Object.keys(firstRow)) {
    columns.push({
      title: key,
      dataIndex: key,
    });
  }
  return columns;
}

function Table({ data, columns }) {
  const classNames = [styles.widgetTable]

  return (
    <div className={classNames.join(' ')}>
      <AntTable rowKey={genRowKey} dataSource={data} columns={columns} />
    </div>
  );
}

Table.propTypes = {
  rawInput: PropTypes.string,
  rawInputEvalResult: PropTypes.shape(Config.LabelCmInput.EvalResult.propTypes),
  data: PropTypes.array,
  columns: PropTypes.array,
};

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

Table.defaultProps = {
  rawInput: demoRawInput,
  data: demoData,
  columns: demoColumns,
};

const initialState = Table.defaultProps;
const ACTION_TYPE = {
  SET_RAW_INPUT: 'setRawInput',
}
function reducer(prevState, action) {
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
          evalResult.msg = `数据不合法。请输入一个 json array，其元素是 json object`;
        }
      } catch (e) {
        evalResult.code = 102;
        evalResult.msg = `数据不合法。请输入一个 json array，其元素是 json object`;
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

    default:
      throw new Error(`in TableWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({ rawInput, rawInputEvalResult, columns, dispatch }) {
  function onRawInputChange(newValue) {
    dispatch({
      type: ACTION_TYPE.SET_RAW_INPUT,
      payload: newValue,
    });
  }

  const { Panel } = Collapse;

  return (
    <Collapse
      defaultActiveKey={['1', '2']}
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
      <Panel header='显示选项' key='2' >
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
