import React, { useState, useEffect, useLayoutEffect, useReducer } from 'react';
import {
  Button,
  Icon,
} from 'antd';
import styles from './EditorCanvas.less';
import { useDrag, useDrop } from 'react-dnd'
import DndItemTypes from './DndItemTypes';
import PropTypes from 'prop-types';
import { getEmptyImage } from "react-dnd-html5-backend";
import throttle from 'lodash.throttle';

const canvasId = 'canvas';

const GRID = {
  columnCnt: 13,
  rowHeight: 40,
}

function updateGridColumnWidth() {
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    GRID.columnWidth = canvas.offsetWidth / (GRID.columnCnt - 1);
    // console.log(`canvas height: ${canvas.offsetHeight}, width: ${canvas.offsetWidth}`);
  }
}

const Grid = ({ canvasHeight }) => {
  const height = canvasHeight + 2 * GRID.rowHeight;
  const dotWidth = 2;
  const offsetToCenter = dotWidth / 2;
  let leftOffset = -offsetToCenter;
  let columns = [];
  for (let i = 0; i < GRID.columnCnt; i++) {
    const style = {
      height: height,
      transform: `translate3d(${leftOffset}px, 0px, 0px)`,
    }
    leftOffset += GRID.columnWidth;
    columns.push(
      <div className={styles.column} style={style} key={i}></div>
    );
  }
  return (
    <div className={styles.grid}>
      {columns}
    </div>
  )
}

const WidgetBox = React.memo((props) => {
  const { gridTop, gridLeft, gridHeight, gridWidth, className, isHover, instanceId } = props;
  const [{ isDragging }, drag, preview] = useDrag({
    item: props,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage());
  }, [])

  console.log(gridLeft, gridTop, gridHeight, gridWidth, className, instanceId);
  const top = gridTop * GRID.rowHeight;
  const left = gridLeft * GRID.columnWidth;
  const style = {
    /*
    // try to optimize performance, use transform instead of top/left, no obvious effect
    top: gridTop * GRID.rowHeight,
    left: gridLeft * GRID.columnWidth,
    */
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * GRID.rowHeight,
    width: gridWidth * GRID.columnWidth,
  }
  const resizeHandlePadding = 2;
  const [boxHPadding, boxVPadding] = [6, 5.5];
  const resizeHandlePositions = {
    'leftTop': {
      transform: `translate(${0-resizeHandlePadding}px, ${0-resizeHandlePadding}px)`,
    },
    'rightTop': {
      transform: `translate(${style.width-boxHPadding-resizeHandlePadding}px, ${0-resizeHandlePadding}px)`,
    },
    'rightBottom': {
      transform: `translate(${style.width-boxHPadding-resizeHandlePadding}px, ${style.height-boxVPadding-resizeHandlePadding}px)`,
    },
    'leftBottom': {
      transform: `translate(${0-resizeHandlePadding}px, ${style.height-boxVPadding-resizeHandlePadding}px)`,
    },
  }
  if (isDragging) {
    style.display = 'none';
  }
  return (
    <div ref={drag} className={className} style={style} >
      {/* the widget */}
      { !isHover && 
        <div style={{height: '100%', width: '100%', backgroundColor: 'rgba(52, 177, 181, 0.6)'}} />
      }

      <div className={styles.resizeHandle} style={ resizeHandlePositions.leftTop }>
        <div className={styles.resizeLeftTop}>
          <div className={styles.resizeIcon} />
        </div>
      </div>
      <div className={styles.resizeHandle} style={ resizeHandlePositions.rightTop }>
        <div className={styles.resizeRightTop}>
          <div className={styles.resizeIcon} />
        </div>
      </div>
      <div className={styles.resizeHandle} style={ resizeHandlePositions.rightBottom }>
        <div className={styles.resizeRightBottom}>
          <div className={styles.resizeIcon} />
        </div>
      </div>
      <div className={styles.resizeHandle} style={ resizeHandlePositions.leftBottom }>
        <div className={styles.resizeLeftBottom}>
          <div className={styles.resizeIcon} />
        </div>
      </div>

    </div>
  )
});

WidgetBox.propTypes = {
  type: PropTypes.string.isRequired,       // widget type
  // instanceId is created when the item is dragged from WidgetPicker 
  // and dropped on the canvas at the first time
  instanceId: PropTypes.number,            // widget instance id of the same type
  gridLeft: PropTypes.number.isRequired,
  gridTop: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridHeight: PropTypes.number.isRequired,
  className: PropTypes.string,
  isHover: PropTypes.bool,
};

WidgetBox.defaultProps = {
  className: styles.widgetBox,
  isHover: false,
  instanceId: 0,
};

function getCanvasOriginOffsetByDOM() {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return [false];
  }

  const rect = canvas.getBoundingClientRect();
  return [ true, rect.x, rect.y ]
}

function calcDropOriginPos({ x: dropOriginX, y: dropOriginY }) {
  // both offsets are relative to viewport
  const [, canvasOriginX, canvasOriginY ] = getCanvasOriginOffsetByDOM();
  const [ x, y ] = [ dropOriginX - canvasOriginX, dropOriginY - canvasOriginY ];

  return [ Math.floor(x / GRID.columnWidth), Math.floor(y / GRID.rowHeight) ];
}

function overlap(newWidget, widgets) {
  for (let widgetId of Object.keys(widgets)) {
    if ('instanceId' in newWidget && newWidget.type + newWidget.instanceId === widgetId) {
      continue;
    }

    const widget = widgets[widgetId];
    // L: left, R: right, T: top, D: down
    const [L1, R1, L2, R2] = [newWidget.gridLeft, newWidget.gridLeft + newWidget.gridWidth, widget.gridLeft, widget.gridLeft + widget.gridWidth];
    const [T1, D1, T2, D2] = [newWidget.gridTop, newWidget.gridTop + newWidget.gridHeight, widget.gridTop, widget.gridTop + widget.gridHeight];
    if (Math.max(L1, L2) < Math.min(R1, R2) && Math.max(T1, T2) < Math.min(D1, D2)) {
      return true;
    }
  }
  return false;
}

const ACTION_TYPE = {
  ADD_OR_UPDATE: 'addOrUpdate',
}
function useWidgetsReducer() {
  const initialWidgets = {};
  function reducer(widgets, action) {
    switch (action.type) {
      case ACTION_TYPE.ADD_OR_UPDATE:
        const newWidget = { ...action.item }
        if ('instanceId' in action.item) {
          // update

        } else {
          // add
          let maxInstanceId = 0;
          for (let widgetId of Object.keys(widgets)) {
            const widget = widgets[widgetId];
            if (widget.type === action.item.type) {
              if (widget.instanceId > maxInstanceId) {
                maxInstanceId = widget.instanceId;
              }
            }
          }
          maxInstanceId++;
          newWidget.instanceId = maxInstanceId;
        }
        return {
          ...widgets, 
          [newWidget.type+newWidget.instanceId]: newWidget,
        };

      default:
        throw new Error(`unexpected action type: ${action.type}`);
    }
  }

  return useReducer(reducer, initialWidgets);
}

function calcNewWidget(item, monitor) {
  const offset = monitor.getClientOffset();
  if (offset) {
    const [ gridLeft, gridTop ] = calcDropOriginPos(offset);
    return {
      ...item,
      gridTop,
      gridLeft,
    }
  } else {
    return null;
  }
}

const handleHoverThrottled = throttle((item, monitor, hoverWidget, setHoverWidget) => {
  const newItem = calcNewWidget(item, monitor);
  if (newItem === null) {
    // handleHoverThrottled.cancel() might be called after drop()
    // newItem will be null if it happens
  } else {
    if (hoverWidget &&
      hoverWidget.gridLeft === newItem.gridLeft &&
      hoverWidget.gridTop === newItem.gridTop
    ) {
    } else {
      if (monitor.canDrop()) {
        newItem.className = styles.hoverWidgetBox;
      } else {
        newItem.className = styles.hoverWidgetBoxCanNotPlace;
      }
      newItem.isHover = true;
      console.log('in hover(), new: ', newItem.gridLeft, newItem.gridTop, newItem.className);
      setHoverWidget(newItem);
    }
  }
}, 16);

function EditorCanvas({}) {
  const [ dragging, setDragging ] = useState(false);
  const [ mounted, setMounted ] = useState(false);
  const [ widgets, dispatch ] = useWidgetsReducer();
  const [ hoverWidget, setHoverWidget ] = useState(null);
  const [ canvasHeight, setCanvasHeight ] = useState(450);

  const [{isOver}, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop(item, monitor) {
      const newItem = calcNewWidget(item, monitor);
      console.log('dropItem:', newItem);
      dispatch({ 
        type: ACTION_TYPE.ADD_OR_UPDATE,
        item: newItem,
      })

      return undefined
    },
    canDrop(item, monitor) {
      const newItem = calcNewWidget(item, monitor);
      return !overlap(newItem, widgets);
    },
    // FIXME(ruitao.xu): performance issue
    //  hover is too expensive: too many unneccesary re-render when mouse hover still
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
      handleHoverThrottled(item, monitor, hoverWidget, setHoverWidget);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      // clientOffset failed to keep updating when isOver was true
      /*
      clientOffset: monitor.getClientOffset(),
      currentDragItem: monitor.getItem(),
      */
    }),
  })

  useLayoutEffect(() => {
    setDragging(isOver);
  }, [isOver])

  useLayoutEffect(() => {
    setMounted(true);
  }, [])

  useLayoutEffect(() => {
    if (isOver) {
    } else {
      setHoverWidget(null);
      handleHoverThrottled.cancel();
    }
  }, [isOver])

  useEffect(() => {
    updateGridColumnWidth();
    window.addEventListener('resize', updateGridColumnWidth);
    return () => {
      window.removeEventListener('resize');
    }
  }, [])

  const toggleGrid = () => {
    setDragging(!dragging);
  }

  const canvasClassArray = [styles.canvas]
  if (dragging) {
    canvasClassArray.push(styles.lift);
  }
  const canvasClassName = canvasClassArray.join(' ');

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div id={canvasId} ref={drop} className={canvasClassName} style={{height: canvasHeight}}>
          { mounted && dragging && <Grid canvasHeight={canvasHeight} /> }
          { mounted && hoverWidget && <WidgetBox {...hoverWidget} /> }
          { mounted && Object.keys(widgets).map(widgetId => (
            <WidgetBox key={widgetId} {...widgets[widgetId]} />
          )) }
          <Button onClick={toggleGrid}>Toggle Grid</Button>
        </div>
      </div>
    </div>
  )
}

export default EditorCanvas;