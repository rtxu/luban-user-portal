import React, { useState, useEffect, useLayoutEffect, useReducer } from 'react';
import {
  Button,
} from 'antd';
import styles from './EditorCanvas.less';
import { useDrag, useDrop } from 'react-dnd'
import DndItemTypes, {isResizeHandle} from './DndItemTypes';
import PropTypes from 'prop-types';
import { getEmptyImage } from "react-dnd-html5-backend";
import throttle from 'lodash.throttle';

const canvasId = 'canvas';

// The following constants come from css. 
// BE CAREFUL: Change it as css changes.
const CSS = {
  resizeHandlePadding: 2,
  widgetBoxHPadding: 6,
  widgetBoxVPadding: 5.5,

  dotWidth: 2,
}

const CANVAS = {
  columnCnt: 12,
  rowHeight: 40,
}

function updateCanvasColumnWidth(setter) {
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    setter(canvas.offsetWidth / CANVAS.columnCnt);
    console.log(`canvas height: ${canvas.offsetHeight}, width: ${canvas.offsetWidth}`);
  }
}

const Grid = ({ canvasHeight, canvasColumnWidth }) => {
  const height = canvasHeight + 2 * CANVAS.rowHeight;
  const { dotWidth } = CSS;
  const offsetToCenter = dotWidth / 2;
  let leftOffset = -offsetToCenter;
  let columns = [];
  for (let i = 0; i < CANVAS.columnCnt+1; i++) {
    const style = {
      height: height,
      transform: `translate3d(${leftOffset}px, 0px, 0px)`,
    }
    leftOffset += canvasColumnWidth;
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

Grid.propTypes = {
  canvasHeight: PropTypes.number.isRequired,
  canvasColumnWidth: PropTypes.number.isRequired,
};

const HoverWidgetBox = React.memo((props) => {
  const { gridTop, gridLeft, gridHeight, gridWidth, canvasColumnWidth, className } = props;
  const top = gridTop * CANVAS.rowHeight;
  const left = gridLeft * canvasColumnWidth;
  const style = {
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * CANVAS.rowHeight,
    width: gridWidth * canvasColumnWidth,
  }
  return (
    <div className={className} style={style} >
    </div>
  )
});

HoverWidgetBox.propTypes = {
  gridLeft: PropTypes.number.isRequired,
  gridTop: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridHeight: PropTypes.number.isRequired,
  className: PropTypes.string.isRequired,
  canvasColumnWidth: PropTypes.number.isRequired,
};

const rhType2StyleMap = {
  [DndItemTypes.RH_LEFT_TOP]: styles.resizeLeftTop,
  [DndItemTypes.RH_RIGHT_TOP]: styles.resizeRightTop,
  [DndItemTypes.RH_RIGHT_BOTTOM]: styles.resizeRightBottom,
  [DndItemTypes.RH_LEFT_BOTTOM]: styles.resizeLeftBottom,
}

const ResizeHandle = React.memo(({type, position, widget}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {type: type, widget: widget},
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage());
  }, [])

  return (
    <div ref={drag} className={styles.resizeHandle} style={ position }>
      <div className={rhType2StyleMap[type]}>
        <div className={styles.resizeIcon} />
      </div>
    </div>
  )
});

const WidgetBox = React.memo((props) => {
  const { gridTop, gridLeft, gridHeight, gridWidth, canvasColumnWidth, isHover, id } = props;
  const [{ isDragging }, drag, preview] = useDrag({
    item: props,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage());
  }, [])

  console.log('WigetBox', gridLeft, gridTop, gridHeight, gridWidth, id );
  const top = gridTop * CANVAS.rowHeight;
  const left = gridLeft * canvasColumnWidth;
  const style = {
    /*
    // try to optimize performance, use transform instead of top/left, no obvious effect
    top: gridTop * CANVAS.rowHeight,
    left: gridLeft * canvasColumnWidth,
    */
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * CANVAS.rowHeight,
    width: gridWidth * canvasColumnWidth,
  }
  const { resizeHandlePadding, widgetBoxHPadding: boxHPadding, widgetBoxVPadding: boxVPadding } = CSS;
  const resizeHandlePositions = {
    [DndItemTypes.RH_LEFT_TOP] : {
      transform: `translate(${0-resizeHandlePadding}px, ${0-resizeHandlePadding}px)`,
    },
    [DndItemTypes.RH_RIGHT_TOP] : {
      transform: `translate(${style.width-boxHPadding-resizeHandlePadding}px, ${0-resizeHandlePadding}px)`,
    },
    [DndItemTypes.RH_RIGHT_BOTTOM]: {
      transform: `translate(${style.width-boxHPadding-resizeHandlePadding}px, ${style.height-boxVPadding-resizeHandlePadding}px)`,
    },
    [DndItemTypes.RH_LEFT_BOTTOM]: {
      transform: `translate(${0-resizeHandlePadding}px, ${style.height-boxVPadding-resizeHandlePadding}px)`,
    },
  }
  if (isDragging || isHover) {
    style.display = 'none';
  }
  return (
    <div ref={drag} className={styles.widgetBox} style={style} >
      {/* the widget */}
      <div style={{height: '100%', width: '100%', backgroundColor: 'rgba(52, 177, 181, 0.6)'}} />

      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_LEFT_TOP} 
        position={resizeHandlePositions[DndItemTypes.RH_LEFT_TOP]} />
      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_RIGHT_TOP} 
        position={resizeHandlePositions[DndItemTypes.RH_RIGHT_TOP]} />
      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_RIGHT_BOTTOM} 
        position={resizeHandlePositions[DndItemTypes.RH_RIGHT_BOTTOM]} />
      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_LEFT_BOTTOM} 
        position={resizeHandlePositions[DndItemTypes.RH_LEFT_BOTTOM]} />

    </div>
  )
});

WidgetBox.propTypes = {
  type: PropTypes.string.isRequired,       // widget type
  instanceId: PropTypes.number.isRequired, // widget instance id of the same type
  id: PropTypes.string.isRequired,         // type+instanceId
  gridLeft: PropTypes.number.isRequired,
  gridTop: PropTypes.number.isRequired,
  gridWidth: PropTypes.number.isRequired,
  gridHeight: PropTypes.number.isRequired,
  canvasColumnWidth: PropTypes.number.isRequired,
  isHover: PropTypes.bool,
};

WidgetBox.defaultProps = {
  isHover: false,
};

function getCanvasOriginOffsetByDOM() {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return [false];
  }

  const rect = canvas.getBoundingClientRect();
  return [ true, rect.x, rect.y ]
}

function calcDropOriginPos({ x: dropOriginX, y: dropOriginY }, canvasColumnWidth) {
  // both offsets are relative to viewport
  const [, canvasOriginX, canvasOriginY ] = getCanvasOriginOffsetByDOM();
  const [ x, y ] = [ dropOriginX - canvasOriginX, dropOriginY - canvasOriginY ];

  return [ Math.floor(x / canvasColumnWidth), Math.floor(y / CANVAS.rowHeight) ];
}

function overlap(newWidget, widgets) {
  for (let widgetId of Object.keys(widgets)) {
    if ('id' in newWidget && newWidget.id === widgetId) {
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
  SET_HOVER: 'setHover',
  CLEAR_HOVER: 'clearHover',
}
function useWidgetsReducer() {
  const initialWidgets = {};
  function reducer(widgets, action) {
    switch (action.type) {
      case ACTION_TYPE.ADD_OR_UPDATE:
        const newWidget = { ...action.item }
        if ('id' in action.item) {
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
          newWidget.id = newWidget.type + newWidget.instanceId;
        }
        return {
          ...widgets, 
          [newWidget.id]: newWidget,
        };

      case ACTION_TYPE.SET_HOVER:
        return {
          ...widgets,
          [action.widgetId]: {
            ...widgets[action.widgetId],
            isHover: true,
          },
        };
      case ACTION_TYPE.CLEAR_HOVER:
        return {
          ...widgets,
          [action.widgetId]: {
            ...widgets[action.widgetId],
            isHover: false,
          },
        };

      default:
        throw new Error(`unexpected action type: ${action.type}`);
    }
  }

  return useReducer(reducer, initialWidgets);
}

function checkBoundary(widget) {
  const result = {
    ...widget
  }
  // rule#1: top [0, +oo)
  if (result.gridTop < 0) {
    result.gridTop = 0;
  }
  // rule#2: left [0, 12)
  if (result.gridLeft < 0) {
    result.gridLeft = 0;
  }
  if (result.gridLeft > CANVAS.columnCnt-1) {
    result.gridLeft = CANVAS.columnCnt-1;
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

function calcNewWidget(item, monitor, canvasColumnWidth) {
  if (isResizeHandle(item.type)) {
    const delta = monitor.getDifferenceFromInitialOffset();
    const newItem = {
      ...item.widget,
    }
    if (delta) {
      const deltaGridX = Math.ceil(delta.x / canvasColumnWidth - 0.5);
      const deltaGridY = Math.ceil(delta.y / CANVAS.rowHeight - 0.5);
      switch(item.type) {
        case DndItemTypes.RH_LEFT_TOP:
          newItem.gridLeft += deltaGridX;
          newItem.gridWidth -= deltaGridX;
          newItem.gridTop += deltaGridY;
          newItem.gridHeight -= deltaGridY;
          break;
        case DndItemTypes.RH_RIGHT_TOP:
          newItem.gridWidth += deltaGridX;
          newItem.gridTop += deltaGridY;
          newItem.gridHeight -= deltaGridY;
          break;

        case DndItemTypes.RH_RIGHT_BOTTOM:
          newItem.gridWidth += deltaGridX;
          newItem.gridHeight += deltaGridY;
          break;
        case DndItemTypes.RH_LEFT_BOTTOM:
          newItem.gridLeft += deltaGridX;
          newItem.gridWidth += -deltaGridX;
          newItem.gridHeight += deltaGridY;
          break;
      }
      return checkBoundary(newItem);

    } else {
      return null;
    }
  } else {
    const offset = monitor.getClientOffset();
    if (offset) {
      const [ gridLeft, gridTop ] = calcDropOriginPos(offset, canvasColumnWidth);
      const newItem = {
        ...item,
        gridTop,
        gridLeft,
      }
      return checkBoundary(newItem);
    } else {
      return null;
    }
  }
}

const handleHoverThrottled = throttle((item, monitor, hoverWidget, setHoverWidget, canvasColumnWidth) => {
  const newItem = calcNewWidget(item, monitor, canvasColumnWidth);
  if (newItem === null) {
    // handleHoverThrottled.cancel() might be called after drop()
    // newItem will be null if it happens
  } else {
    if (hoverWidget &&
      hoverWidget.gridLeft === newItem.gridLeft &&
      hoverWidget.gridTop === newItem.gridTop &&
      hoverWidget.gridHeight === newItem.gridHeight &&
      hoverWidget.gridWidth === newItem.gridWidth
    ) {
    } else {
      if (monitor.canDrop()) {
        newItem.className = styles.hoverWidgetBox;
      } else {
        newItem.className = styles.hoverWidgetBoxCanNotPlace;
      }
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
  const [ canvasColumnWidth, setCanvasColumnWidth ] = useState(0);

  const setHover = (widget) => {
    setHoverWidget(widget);
    if (widget && 'id' in widget) {
      dispatch({
        type: ACTION_TYPE.SET_HOVER,
        widgetId: widget.id,
      });
    }
  }
  const clearHover = () => {
    handleHoverThrottled.cancel();
    if (hoverWidget && 'id' in hoverWidget) {
    dispatch({
      type: ACTION_TYPE.CLEAR_HOVER,
      widgetId: hoverWidget.id,
    });
    }
    setHoverWidget(null);
  }

  const [{isOver}, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop(item, monitor) {
      const newItem = calcNewWidget(item, monitor, canvasColumnWidth);
      console.log('dropItem:', newItem);
      dispatch({ 
        type: ACTION_TYPE.ADD_OR_UPDATE,
        item: newItem,
      })

      return undefined
    },
    canDrop(item, monitor) {
      const newItem = calcNewWidget(item, monitor, canvasColumnWidth);
      return !overlap(newItem, widgets);
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
      handleHoverThrottled(item, monitor, hoverWidget, setHover, canvasColumnWidth);
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
    if (isOver) {
    } else {
      clearHover();
    }
  }, [isOver])

  useLayoutEffect(() => {
    setMounted(true);
  }, [])

  useEffect(() => {
    const update = updateCanvasColumnWidth.bind(this, setCanvasColumnWidth);
    // FIXME(ruitao.xu):
    // Bug: the first cavas offsetWidth is wider than the actual(always more 200px) when the first update
    // solution(fixed, but I DONOT know why): add 500ms delay to the first update
    setTimeout(update, 500);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
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
          { mounted && dragging && <Grid canvasHeight={canvasHeight} canvasColumnWidth={canvasColumnWidth} /> }
          { mounted && hoverWidget && <HoverWidgetBox {...hoverWidget} canvasColumnWidth={canvasColumnWidth} /> }
          { mounted && Object.keys(widgets).map(widgetId => (
            <WidgetBox key={widgetId} {...widgets[widgetId]} canvasColumnWidth={canvasColumnWidth} />
          )) }
          <Button onClick={toggleGrid}>Toggle Grid</Button>
        </div>
      </div>
    </div>
  )
}

export default EditorCanvas;