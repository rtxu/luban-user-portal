import React, { useRef, useReducer, useState, } from 'react';
import PropTypes from 'prop-types';
import { 
  Collapse,
  Table as AntTable,
} from "antd";
import produce from 'immer';
import { Resizable } from 'react-resizable';
import throttle from 'lodash.throttle';

import { assert, createLogger } from '@/util';
import styles from './Table.less';
import Config from '../Config';
import OneLineOverflowText from './OneLineOverflowText';
import ColumnCollapse from './ColumnCollapse';

const logger = createLogger('/components/widgets/Table');

const { Panel } = Collapse;

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

function getCellStyle(width) {
  let style = {}
  if (width) {
    style = {
      flex: `${width} 0 auto`,
      width: `${width}px`,
      maxWidth: `${width}px`,
    }
  }
  return style;
}

// TODO(ruitao.xu): consider to disable the last column's resize ability by default
function ResizableHeaderCell(props) {
  const { onSetColumnWidth, width, ...restProps } = props;
  const ref = useRef(null);
  const [start, setStart] = useState(0);
  const handleResizeStart = (e, { size }) => {
    e.preventDefault();

    setStart(size.width);
  }
  const handleResize = throttle((e, { size }) => {
    const delta = size.width - start;
    logger.debug(`resize column width, delta: ${delta}`);
    if (delta != 0) {
      const curWidth = ref.current.getBoundingClientRect().width;
      logger.debug(`resize column width, current width: ${curWidth}`);
      onSetColumnWidth(curWidth + delta);
    }
    setStart(start + delta);
  }, 16)

  return (
    <Resizable
      width={100}
      height={0}
      axis={'x'}
      onResize={handleResize}
      onResizeStart={handleResizeStart}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th ref={ref} {...restProps} style={getCellStyle(width)} />
    </Resizable>
  );
}

function OverflowBodyCell({ record, dataIndex, verticalPadding, width, ...restProps }) {
  const style = {
    ...getCellStyle(width),
    padding: `${verticalPadding}px 8px`,
  }
  return (
    <td {...restProps} style={style} >
      <OneLineOverflowText text={String(record[dataIndex])} />
    </td>
  )
}

function calcRowHeight(totalHeight, expectRowHeight, pageSize) {
  if (pageSize < 1) {
    return {
      pageSize: 1,
      rowHeight: expectRowHeight,
      extraHeight: 0,
    }
  }
  let extraHeight = totalHeight - expectRowHeight * pageSize;
  const delta = Math.floor(extraHeight / pageSize);
  const rowHeight = expectRowHeight + delta;
  extraHeight -= delta * pageSize;
  assert(extraHeight >= 0);
  return {
    pageSize,
    rowHeight,
    extraHeight,
  }
}

function calcAdaptivePageSize(height, isCompact) {
  const simplePaginationHeight = 24 + 2 * 16 /* vertical margin: 16px */;
  // small: 8  middle: 12  default: 16
  const middleSizeTableVerticalPadding = 12;
  const borderHeight = 1;
  const contentAreaHeight = 14 /* font-size */ * 1.5 /* line-height */;

  const middleSizeTableHeaderHeight = contentAreaHeight + 2 * middleSizeTableVerticalPadding + borderHeight;
  const restHeight = height - middleSizeTableHeaderHeight - simplePaginationHeight;

  let answer = {}
  if (isCompact) {
    const expectRowHeight = contentAreaHeight + borderHeight;
    answer = calcRowHeight(restHeight, expectRowHeight, Math.floor(restHeight / expectRowHeight));
  } else {
    const expectRowHeight = contentAreaHeight + (2 * middleSizeTableVerticalPadding) + borderHeight;
    const option1 = calcRowHeight(restHeight, expectRowHeight, Math.floor(restHeight / expectRowHeight));
    const option2 = calcRowHeight(restHeight, expectRowHeight, Math.ceil(restHeight / expectRowHeight));

    answer = option1;
    if (Math.abs(option2.rowHeight - expectRowHeight) < Math.abs(option1.rowHeight - expectRowHeight)) {
      answer = option2;
    }
  }
  const bodyCellVerticalPadding = (answer.rowHeight - (contentAreaHeight + borderHeight)) / 2;
  /*
  console.log('calcAdaptivePageSize', {
    isCompact,
    expectRowHeight: answer.rowHeight,
    answer,
    bodyCellVerticalPadding: bodyCellVerticalPadding,
    scrollY: restHeight,
  });
  */

  return {
    ...answer, 
    bodyCellVerticalPadding, 
    scrollY: restHeight,
  }
}

function renderFooter(rowCnt, pageSize, rowHeight, extraHeight) {
  assert(rowCnt < pageSize);
  const borderHeight = 1;
  const footerHeight = rowHeight * (pageSize - rowCnt) - (2 * borderHeight) + extraHeight;
  return <div style={{height: footerHeight, margin: -16}} ></div>
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
  height: PropTypes.number.isRequired,
  isCompact: PropTypes.bool,

  selectedRowIndex: PropTypes.number.isRequired, 

  dispatch: PropTypes.func.isRequired,
};

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

Table.defaultProps = {
  rawInput: demoRawInput,
  data: demoData,
  columns: demoColumns,
  lastValidColumns: demoColumns,
  height: 320,
  isCompact: false,
  selectedRowIndex: 0,
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
  moveColumn: Symbol(),
  setColumnWidth: Symbol(),
  setIsCompact: Symbol(),
  setSelectedRowIndex: Symbol(),
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
    case ACTION_TYPE.moveColumn:
      const fromIndex = action.payload.from;
      const toIndex = action.payload.to;
      return produce(prevState, draft => {
        const from = prevState.columns[fromIndex];
        draft.columns.splice(fromIndex, 1);
        draft.columns.splice(toIndex, 0, from);
      })
    case ACTION_TYPE.setColumnWidth:
      const { index, width } = action.payload;
      logger.debug(`in table reducer, setColumnWidth(index=${index}, width=${width})`);
      return produce(prevState, draft => {
        draft.columns[index].config.width = width;
      })
    case ACTION_TYPE.setIsCompact:
      return produce(prevState, draft => {
        draft.isCompact = action.payload;
      })
    case ACTION_TYPE.setSelectedRowIndex:
      return produce(prevState, draft => {
        draft.selectedRowIndex = action.payload;
      })

    default:
      throw new Error(`in TableWidget reducer(): unexpected action type: ${action.type}`);
  }
}

export function ColumnCollapseContainer({ children }) {
  return (
    <div className={styles.removeBottomPadding} >
      {children}
    </div>
  )
}

function ConfigPanel(props) {
  const { rawInput, rawInputEvalResult, columns, dispatch, isCompact } = props;
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
  function moveColumn(from, to) {
    dispatch({
      type: ACTION_TYPE.moveColumn,
      payload: {
        from: from,
        to: to,
      }
    })
  }
  function setIsCompact(checked) {
    dispatch({
      type: ACTION_TYPE.setIsCompact,
      payload: checked,
    })
  }

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
        <Config.Switch 
          checked={isCompact} 
          onChange={setIsCompact}
          description='紧凑模式' 
        />
      </Panel>
      <Panel header='列选项' key='2' >
        <Config.Label value='单列选项' />
        <ColumnCollapseContainer>
          {
            columns.map((column, index) => (
              <ColumnCollapse 
                key={column.config.dataIndex}
                name={column.config.dataIndex} 
                index={index}
                visible={column.meta.visible}
                visibleOnClick={toggleColumnVisibility}
                moveColumn={moveColumn}
              />
            ))
          }
        </ColumnCollapseContainer>
      </Panel>
    </Collapse>
  );
}

function Table({ 
  data, 
  columns, 
  height, 
  dispatch, 
  isCompact,
  selectedRowIndex, 
}) {
  const [displayData, displayColumns] = display(data, columns);
  const {pageSize, rowHeight, bodyCellVerticalPadding, scrollY, extraHeight} = calcAdaptivePageSize(height, isCompact); 

  const components = {
    header: {
      cell: ResizableHeaderCell,
    },
    body: {
      cell: OverflowBodyCell,
    },
  }

  const setColumnWidth = index => (newWidth) => {
    dispatch({
      type: ACTION_TYPE.setColumnWidth,
      payload: {
        index,
        width: newWidth,
      },
    })
  };

  const displayColumns2 = displayColumns.map((col, index) => {
    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        verticalPadding: bodyCellVerticalPadding,
        width: col.width,
      }),
      onHeaderCell: column => ({
        width: column.width,
        onSetColumnWidth: setColumnWidth(index),
      }),
    };
  });

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCurrentPageRowIndex, setSelectedCurrentPageRowIndex] = useState(0);

  return (
    <div className={styles.widgetTable}>
      <AntTable rowKey={genRowKey} dataSource={displayData} columns={displayColumns2}
        bordered
        components={components}
        // 将 y 设置成 100% 并不能达到限定宽高的目的，不知道 why
        scroll={{x: '100%', y: scrollY}}
        pagination={{
          simple: true, 
          current: currentPage,
          pageSize: pageSize, 
          hideOnSinglePage: true, 
          onChange: (page, pageSize) => {
            setCurrentPage(page);
          },
        }}
        size='middle'
        onRow={ (record, index) => {
          return {
            onClick: (e) => {
              setSelectedCurrentPageRowIndex(index);
              dispatch({
                type: ACTION_TYPE.setSelectedRowIndex,
                payload: (currentPage-1) * pageSize + index,
              });
            },
          }
        } }
        rowClassName={(record, index) => {
          if (((currentPage-1) * pageSize + index) === selectedRowIndex) {
            return styles.selected;
          } else {
            return '';
          }
        } }
      />
    </div>
  );
}


ConfigPanel.propTypes = {
  ...Table.PropTypes,
  dispatch: PropTypes.func.isRequired,
}
Table.ConfigPanel = ConfigPanel;
Table.initialState = initialState;
Table.reducer = reducer;
Table.exporter = (props) => {
  const selectedRow = {
    index: props.selectedRowIndex,
  }
  if (props.data.length > selectedRow.index) {
    selectedRow.data = props.data[selectedRow.index];
  }
  
  return {
    data: props.data,
    selectedRow,
  }
}

Table.use = () => {
  const [widgetProps, widgetDispatch] = useReducer(Table.reducer, Table.initialState);
  return ([<Table {...widgetProps} dispatch={widgetDispatch} />, 
    widgetProps, 
  <Table.ConfigPanel dispatch={widgetDispatch} {...widgetProps} />]);
}

export default Table;
