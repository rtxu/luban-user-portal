import React, { useState, useContext, useLayoutEffect } from "react";
import { useDrop } from "react-dnd";
import PropTypes from "prop-types";
import throttle from "lodash.throttle";
import classNames from "classnames";
import { useMeasure } from "react-use";

import WidgetBox from "./WidgetBox";
import { CSS, CANVAS } from "./constant";
import styles from "./EditorCanvas.less";
import DndItemTypes, { isResizeHandle } from "./DndItemTypes";
import { createLogger } from "@/util";
import { AppContext } from "../containers/AppContextProvider";
import { EditorContext } from "../containers/withEditorContext";

const logger = createLogger("/components/editor/EditorCanvas");

const canvasId = "canvas";

const Grid = ({ canvasHeight, canvasColumnWidth }) => {
  const height = canvasHeight + 2 * CANVAS.rowHeight;
  const { dotWidth } = CSS;
  const offsetToCenter = dotWidth / 2;
  let leftOffset = -offsetToCenter;
  let columns = [];
  for (let i = 0; i < CANVAS.columnCnt + 1; i++) {
    const style = {
      height: height,
      transform: `translate3d(${leftOffset}px, 0px, 0px)`
    };
    leftOffset += canvasColumnWidth;
    columns.push(<div className={styles.column} style={style} key={i}></div>);
  }
  return <div className={styles.grid}>{columns}</div>;
};

Grid.propTypes = {
  canvasHeight: PropTypes.number.isRequired,
  canvasColumnWidth: PropTypes.number.isRequired
};

const HoverWidgetBox = React.memo(props => {
  const {
    gridTop,
    gridLeft,
    gridHeight,
    gridWidth,
    canvasColumnWidth,
    className
  } = props;
  const top = gridTop * CANVAS.rowHeight;
  const left = gridLeft * canvasColumnWidth;
  const style = {
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * CANVAS.rowHeight,
    width: gridWidth * canvasColumnWidth
  };
  return <div className={className} style={style}></div>;
});

HoverWidgetBox.propTypes = {
  gridLeft: PropTypes.number.isRequired,
  gridTop: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridHeight: PropTypes.number.isRequired,
  className: PropTypes.string.isRequired,
  canvasColumnWidth: PropTypes.number.isRequired
};

function getCanvasOriginOffsetByDOM() {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return [false];
  }

  const rect = canvas.getBoundingClientRect();
  return [true, rect.x, rect.y];
}

function calcDropOriginPos(
  { x: dropOriginX, y: dropOriginY },
  canvasColumnWidth
) {
  // both offsets are relative to viewport
  const [, canvasOriginX, canvasOriginY] = getCanvasOriginOffsetByDOM();
  const [x, y] = [dropOriginX - canvasOriginX, dropOriginY - canvasOriginY];

  return [Math.floor(x / canvasColumnWidth), Math.floor(y / CANVAS.rowHeight)];
}

function overlap(newWidget, widgets) {
  for (let widgetId of Object.keys(widgets)) {
    if ("id" in newWidget && newWidget.id === widgetId) {
      continue;
    }

    const widget = widgets[widgetId];
    // L: left, R: right, T: top, D: down
    const [L1, R1, L2, R2] = [
      newWidget.gridLeft,
      newWidget.gridLeft + newWidget.gridWidth,
      widget.gridLeft,
      widget.gridLeft + widget.gridWidth
    ];
    const [T1, D1, T2, D2] = [
      newWidget.gridTop,
      newWidget.gridTop + newWidget.gridHeight,
      widget.gridTop,
      widget.gridTop + widget.gridHeight
    ];
    if (
      Math.max(L1, L2) < Math.min(R1, R2) &&
      Math.max(T1, T2) < Math.min(D1, D2)
    ) {
      return true;
    }
  }
  return false;
}

function checkBoundary(widget) {
  const result = {
    ...widget
  };
  // rule#1: top [0, +oo)
  if (result.gridTop < 0) {
    result.gridTop = 0;
  }
  // rule#2: left [0, 12)
  if (result.gridLeft < 0) {
    result.gridLeft = 0;
  }
  if (result.gridLeft > CANVAS.columnCnt - 1) {
    result.gridLeft = CANVAS.columnCnt - 1;
  }
  // rule#3: min-height = 1
  result.gridHeight = Math.max(1, result.gridHeight);
  // rule#4: min-width = 1
  result.gridWidth = Math.max(1, result.gridWidth);
  // rule#5: right=left+width, (1, 12]
  const gridRight = result.gridLeft + result.gridWidth;
  if (gridRight < 1) {
    gridRight = 1;
  }
  if (gridRight > CANVAS.columnCnt) {
    result.gridLeft = CANVAS.columnCnt - result.gridWidth;
  }

  return result;
}

/* BETTER(user experience) TODO(ruitao.xu): 目前的 calcNewWidget 主要处理两种场景
  1. 创建 Widget，首次从 WidgetPicker 拖拽到 EditorCanvas 之时。
  2. resize WidgetBox 之时

  但是并未考虑在 EditorCanvas 之内移动的状态，此时因为 Widget 比较大，
  而用户拖拽的点可能距离 Widget 的左上顶点较远，如果仍以左上顶点作为 
  drop position，体验不好。用拖拽的相对距离调整顶点位置体验更好。
*/
function calcNewWidget(item, monitor, canvasColumnWidth) {
  if (isResizeHandle(item.type)) {
    const delta = monitor.getDifferenceFromInitialOffset();
    const newWidget = {
      ...item.widget
    };
    if (delta) {
      // 移动量超过半个单元格，则自适应到下个单元格
      const deltaGridX = Math.ceil(delta.x / canvasColumnWidth - 0.5);
      const deltaGridY = Math.ceil(delta.y / CANVAS.rowHeight - 0.5);
      switch (item.type) {
        case DndItemTypes.RH_LEFT_TOP:
          newWidget.gridLeft += deltaGridX;
          newWidget.gridWidth -= deltaGridX;
          newWidget.gridTop += deltaGridY;
          newWidget.gridHeight -= deltaGridY;
          break;
        case DndItemTypes.RH_RIGHT_TOP:
          newWidget.gridWidth += deltaGridX;
          newWidget.gridTop += deltaGridY;
          newWidget.gridHeight -= deltaGridY;
          break;

        case DndItemTypes.RH_RIGHT_BOTTOM:
          newWidget.gridWidth += deltaGridX;
          newWidget.gridHeight += deltaGridY;
          break;
        case DndItemTypes.RH_LEFT_BOTTOM:
          newWidget.gridLeft += deltaGridX;
          newWidget.gridWidth += -deltaGridX;
          newWidget.gridHeight += deltaGridY;
          break;
      }
      return checkBoundary(newWidget);
    } else {
      return null;
    }
  } else {
    const offset = monitor.getClientOffset();
    if (offset) {
      const [gridLeft, gridTop] = calcDropOriginPos(offset, canvasColumnWidth);
      const newWidget = {
        ...item,
        gridTop,
        gridLeft
      };
      return checkBoundary(newWidget);
    } else {
      return null;
    }
  }
}

const handleHoverThrottled = throttle(
  (item, monitor, hoverWidget, setHoverWidget, canvasColumnWidth) => {
    const newWidget = calcNewWidget(item, monitor, canvasColumnWidth);
    if (newWidget === null) {
      // handleHoverThrottled.cancel() might be called after drop()
      // newWidget will be null if it happens
    } else {
      if (
        hoverWidget &&
        hoverWidget.gridLeft === newWidget.gridLeft &&
        hoverWidget.gridTop === newWidget.gridTop &&
        hoverWidget.gridHeight === newWidget.gridHeight &&
        hoverWidget.gridWidth === newWidget.gridWidth
      ) {
      } else {
        if (monitor.canDrop()) {
          newWidget.className = styles.hoverWidgetBox;
        } else {
          newWidget.className = styles.hoverWidgetBoxCanNotPlace;
        }
        logger.debug(
          "in hover(), new: ",
          newWidget.gridLeft,
          newWidget.gridTop,
          newWidget.className
        );
        setHoverWidget(newWidget);
      }
    }
  },
  16
);

function updateCanvasHeight(hoverWidget, widgets, setter) {
  const newHeightOptions = [CANVAS.minHeight - 2 * CANVAS.rowHeight];
  if (hoverWidget) {
    newHeightOptions.push(
      (hoverWidget.gridTop + hoverWidget.gridHeight) * CANVAS.rowHeight
    );
  }
  if (widgets) {
    for (let widgetId of Object.keys(widgets)) {
      const w = widgets[widgetId];
      newHeightOptions.push((w.gridTop + w.gridHeight) * CANVAS.rowHeight);
    }
  }
  const newHeight = Math.max(...newHeightOptions) + 2 * CANVAS.rowHeight;
  setter(newHeight);
}

// BETTER(user experience) TODO(ruitao.xu): custom drag layer, 在整个 viewport 上真实地显示当前的 dragitem 的位置，不 SnapToGrid
// BETTER(user experience) TODO(ruitao.xu): 当 overlap 时，实时调整 widget 位置，优先保证当前拖拽 item 的位置
// 可以调研下 [react-grid-layout](https://github.com/STRML/react-grid-layout) 看是否满足需求
function EditorCanvas() {
  const [{ widgets }, { widgetDispatch }] = useContext(AppContext);
  const [
    { activeWidgetId },
    { setActiveWidgetId, addOrUpdateWidget, deleteWidget }
  ] = useContext(EditorContext);
  const [hoverWidget, setHoverWidget] = useState(null);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS.minHeight);
  const [canvasRef, { width }] = useMeasure();
  const canvasColumnWidth = width / CANVAS.columnCnt;

  const setHover = widget => {
    setHoverWidget(widget);
  };
  const clearHover = () => {
    handleHoverThrottled.cancel();
    setHoverWidget(null);
  };

  const [{ isOver }, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop(item, monitor) {
      const newWidget = calcNewWidget(item, monitor, canvasColumnWidth);
      console.log("dropItem:", newWidget);
      addOrUpdateWidget(newWidget);
      return undefined;
    },
    canDrop(item, monitor) {
      const newWidget = calcNewWidget(item, monitor, canvasColumnWidth);
      return !overlap(newWidget, widgets);
    },
    // Performance Issue:
    //  hover is too expensive: too many unneccesary re-render when mouse hover, even hover still
    // solution#1: (not tried yet)
    //  CustomizedDragLayer example in react-dnd official site shows that
    //  no re-render when mouse hover still
    //  ref: https://codesandbox.io/s/react-dnd-example-6-qnhd0
    // solution#2: optimization effect is obvious
    //  unneccesary re-render comes from WidgetBox mainly,
    //  so re-impl WidgetBox wrapped by React.memo()
    //  ref: https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-shouldcomponentupdate

    // hover is called very frequently, so throttle it
    // ref: https://reactjs.org/docs/faq-functions.html#how-can-i-prevent-a-function-from-being-called-too-quickly-or-too-many-times-in-a-row
    hover(item, monitor) {
      handleHoverThrottled(
        item,
        monitor,
        hoverWidget,
        setHover,
        canvasColumnWidth
      );
    },
    collect: monitor => ({
      isOver: monitor.isOver()
      // clientOffset failed to keep updating when isOver was true
      /*
      clientOffset: monitor.getClientOffset(),
      currentDragItem: monitor.getItem(),
      */
    })
  });

  useLayoutEffect(() => {
    if (isOver) {
    } else {
      clearHover();
    }
  }, [isOver]);

  useLayoutEffect(() => {
    updateCanvasHeight(hoverWidget, widgets, setCanvasHeight);
  }, [hoverWidget, widgets]);

  const canvasClassName = classNames({
    [styles.canvas]: true,
    [styles.lift]: isOver
  });

  function widgetOnClick(widgetId, e) {
    setActiveWidgetId(widgetId);
    // DO NOT bubble up, which will clear the selected state
    e.stopPropagation();
  }

  // when to remove the current active state
  // 1. click non-widget area on the canvas
  // 2. delete the current active widget
  return (
    <div className={styles.root} onClick={() => setActiveWidgetId(null)}>
      <div className={styles.container}>
        <div ref={drop}>
          <div
            id={canvasId}
            ref={canvasRef}
            className={canvasClassName}
            style={{ height: canvasHeight }}
          >
            {isOver && (
              <Grid
                canvasHeight={canvasHeight}
                canvasColumnWidth={canvasColumnWidth}
              />
            )}
            {hoverWidget && (
              <HoverWidgetBox
                {...hoverWidget}
                canvasColumnWidth={canvasColumnWidth}
              />
            )}
            {Object.keys(widgets).map(widgetId => (
              <WidgetBox
                key={widgetId}
                {...widgets[widgetId]}
                canvasColumnWidth={canvasColumnWidth}
                showBorder={hoverWidget !== null}
                selected={widgetId === activeWidgetId}
                onClick={e => widgetOnClick(widgetId, e)}
                onDeleteOne={widgetId => {
                  deleteWidget(widgetId);
                  setActiveWidgetId(null);
                }}
                onWidgetDispatch={widgetDispatch}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorCanvas;
