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
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
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
const demoColumns = genColumnsByFirstRow(demoData[0]);

Table.defaultProps = {
  data: demoData,
  columns: demoColumns,
};

const initialState = Table.defaultProps;
const ACTION_TYPE = {
}
function reducer(prevState, action) {
  switch (action.type) {

    default:
      throw new Error(`in TableWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({ data, columns, dispatch }) {

  const { Panel } = Collapse;

  return (
    <Collapse
      defaultActiveKey={['1', '2']}
      expandIconPosition='right'
    >
      <Panel header='内容' key='1' >
        <Config.LabelCmInput 
          label={{ value: '数据', }}
          input={{ value: JSON.stringify(data, null, 2), }}
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
