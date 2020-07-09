import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Table as AntTable } from "antd";
import { Resizable } from "react-resizable";
import throttle from "lodash.throttle";

import { assert } from "@/util";
import styles from "./Widget.less";
import Config from "../Config";
import OneLineOverflowText from "./OneLineOverflowText";
import { setColumnWidth, setSelectedRowIndex } from "./reducer";
import { logger } from "./common";

// LATER(ruitao.xu): 单纯用 index 可能存在问题，比如两次 API 加载回来的数据第一行 key 都是 1，会导致 react 不更新数据
function genRowKey(record, index) {
  return index;
}

function extractVisiable(data, columns) {
  const visiableColumns = columns
    .filter(column => column.meta.visible)
    .map(column => column.config);
  const visiableData = data.map(record => {
    return visiableColumns.reduce((newRecord, column) => {
      newRecord[column.dataIndex] = record[column.dataIndex];
      return newRecord;
    }, {});
  });
  return [visiableData, visiableColumns];
}

/**
 * 功能：组件的整体大小由用户决定，对于表格组件来说，我们想实现的功能是：
 * 1. 单列最小宽度：100px
 * 2. 列宽自适应，当列数较少时，多余的空间在多个列中平均分配；当列数较多时，以 100px 为最小单位，横向排列
 * 3. 用户可以手动调整列宽，手动调整的列宽不具有自适应功能
 *
 * 实现方式：
 *  width: 100px;     // 指定宽度为 100px
 *  flex: 100 0 auto; // 禁止 shrink，故实现最小列宽，支持 grow，按比例分配多余空间
 * 用户手动调整宽度后:
 *  width = max-width = <user-width>  // 用 max-width = width 的方式限制列宽，使其列宽固定
 *  flex: <width> 0 auto;
 */
const defaultCellStyle = {
  flex: "1 0 auto",
  width: "100px"
};
function getCellWidthStyle(width) {
  if (width) {
    return {
      flex: "1 0 auto",
      width: `${width}px`,
      maxWidth: `${width}px`
    };
  } else {
    return defaultCellStyle;
  }
}

function TableRow(props) {
  const { style, ...restProps } = props;
  return <tr {...restProps} style={{ ...style, display: "flex" }} />;
}

// TODO(ruitao.xu): consider to disable the last column's resize ability by default
function ResizableHeaderCell(props) {
  const { onSetColumnWidth, width, ...restProps } = props;
  const ref = useRef(null);
  const [start, setStart] = useState(0);
  const handleResizeStart = (e, { size }) => {
    e.preventDefault();

    setStart(size.width);
  };
  const handleResize = throttle((e, { size }) => {
    const delta = size.width - start;
    logger.debug(`resize column width, delta: ${delta}`);
    if (delta != 0) {
      const curWidth = ref.current.getBoundingClientRect().width;
      logger.debug(`resize column width, current width: ${curWidth}`);
      onSetColumnWidth(curWidth + delta);
    }
    setStart(start + delta);
  }, 16);

  return (
    <Resizable
      width={100}
      height={0}
      axis={"x"}
      onResize={handleResize}
      onResizeStart={handleResizeStart}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th ref={ref} {...restProps} style={getCellWidthStyle(width)} />
    </Resizable>
  );
}

function OverflowBodyCell({
  record,
  dataIndex,
  verticalPadding,
  width,
  ...restProps
}) {
  const style = {
    ...getCellWidthStyle(width),
    padding: `${verticalPadding}px 8px`
  };
  return (
    <td {...restProps} style={style}>
      <OneLineOverflowText text={String(record[dataIndex])} />
    </td>
  );
}

function calcRowHeight(totalHeight, expectRowHeight, pageSize) {
  if (pageSize < 1) {
    return {
      pageSize: 1,
      rowHeight: expectRowHeight,
      extraHeight: 0
    };
  }
  let extraHeight = totalHeight - expectRowHeight * pageSize;
  const delta = Math.floor(extraHeight / pageSize);
  const rowHeight = expectRowHeight + delta;
  extraHeight -= delta * pageSize;
  assert(extraHeight >= 0);
  return {
    pageSize,
    rowHeight,
    extraHeight
  };
}

/**
一个表格区域分为：
-------------------
|     header      |
-------------------
|      body       |
-------------------
|   pagination    |
-------------------
 */
function calcAdaptivePageSize(height, isCompact) {
  const simplePaginationHeight = 24 + 2 * 16; /* vertical margin: 16px */
  // small: 8  middle: 12  default: 16
  const middleSizeTableVerticalPadding = 12;
  const borderHeight = 1;
  const contentAreaHeight = 14 /* font-size */ * 1.5; /* line-height */

  const middleSizeTableHeaderHeight =
    contentAreaHeight + 2 * middleSizeTableVerticalPadding + borderHeight;
  const restHeight =
    height - middleSizeTableHeaderHeight - simplePaginationHeight;

  let answer = {};
  if (isCompact) {
    const expectRowHeight = contentAreaHeight + borderHeight;
    answer = calcRowHeight(
      restHeight,
      expectRowHeight,
      Math.floor(restHeight / expectRowHeight)
    );
  } else {
    const expectRowHeight =
      contentAreaHeight + 2 * middleSizeTableVerticalPadding + borderHeight;
    const option1 = calcRowHeight(
      restHeight,
      expectRowHeight,
      Math.floor(restHeight / expectRowHeight)
    );
    const option2 = calcRowHeight(
      restHeight,
      expectRowHeight,
      Math.ceil(restHeight / expectRowHeight)
    );

    answer = option1;
    if (
      Math.abs(option2.rowHeight - expectRowHeight) <
      Math.abs(option1.rowHeight - expectRowHeight)
    ) {
      answer = option2;
    }
  }
  const bodyCellVerticalPadding =
    (answer.rowHeight - (contentAreaHeight + borderHeight)) / 2;
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
    scrollY: restHeight
  };
}

function renderFooter(rowCnt, pageSize, rowHeight, extraHeight) {
  assert(rowCnt < pageSize);
  const borderHeight = 1;
  const footerHeight =
    rowHeight * (pageSize - rowCnt) - 2 * borderHeight + extraHeight;
  return <div style={{ height: footerHeight, margin: -16 }}></div>;
}

const ColumnMeta = {
  propTypes: {
    visible: PropTypes.bool
  },
  defaultProps: {
    visible: true
  }
};

// used by antd/Table
const ColumnConfig = {
  propTypes: {
    title: PropTypes.string.isRequired,
    dataIndex: PropTypes.string.isRequired
  }
};

const Column = {
  propTypes: {
    meta: PropTypes.shape(ColumnMeta.propTypes),
    config: PropTypes.shape(ColumnConfig.propTypes)
  },
  defaultProps: {
    meta: ColumnMeta.defaultProps
  }
};

Table.propTypes = {
  dataInput: PropTypes.string,
  dataInputEvalResult: PropTypes.shape(
    Config.LabelCmEvalInput.EvalResult.propTypes
  ),
  data: PropTypes.arrayOf(PropTypes.object),
  dataError: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape(Column.propTypes)),
  lastValidColumns: PropTypes.arrayOf(PropTypes.shape(Column.propTypes)),
  height: PropTypes.number.isRequired,
  isCompact: PropTypes.bool,

  selectedRowIndex: PropTypes.number.isRequired,

  dispatch: PropTypes.func.isRequired
};

function Table({
  data,
  columns,
  height,
  dispatch,
  isCompact,
  selectedRowIndex
}) {
  // 用户可以设置某些列不展示
  const [visiableData, visiableColumns] = extractVisiable(data, columns);

  const { pageSize, bodyCellVerticalPadding, scrollY } = calcAdaptivePageSize(
    height,
    isCompact
  );

  const setIndexColumnWidth = index => newWidth => {
    dispatch(
      setColumnWidth({
        index,
        width: newWidth
      })
    );
  };
  const componentColumns = visiableColumns.map((col, index) => {
    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        verticalPadding: bodyCellVerticalPadding,
        width: col.width
      }),
      onHeaderCell: column => ({
        width: column.width,
        onSetColumnWidth: setIndexColumnWidth(index)
      })
    };
  });
  const components = {
    header: {
      row: TableRow,
      cell: ResizableHeaderCell
    },
    body: {
      row: TableRow,
      cell: OverflowBodyCell
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [
    selectedCurrentPageRowIndex,
    setSelectedCurrentPageRowIndex
  ] = useState(0);

  return (
    <div className={styles.widgetTable}>
      <AntTable
        rowKey={genRowKey}
        dataSource={visiableData}
        columns={componentColumns}
        bordered
        components={components}
        // 将 y 设置成 100% 并不能达到限定高度的目的，不知道 why
        scroll={{ x: "100%", y: scrollY }}
        pagination={{
          simple: true,
          current: currentPage,
          pageSize: pageSize,
          hideOnSinglePage: true,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
          }
        }}
        size="middle"
        onRow={(record, index) => {
          return {
            onClick: e => {
              setSelectedCurrentPageRowIndex(index);
              dispatch(
                setSelectedRowIndex((currentPage - 1) * pageSize + index)
              );
            }
          };
        }}
        rowClassName={(record, index) => {
          if ((currentPage - 1) * pageSize + index === selectedRowIndex) {
            return styles.selected;
          } else {
            return "";
          }
        }}
      />
    </div>
  );
}

export default Table;
