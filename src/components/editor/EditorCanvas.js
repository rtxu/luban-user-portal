import React, { useState, useEffect, useLayoutEffect, useReducer } from 'react';
import {
  Button,
} from 'antd';
import { useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { connect } from 'dva';
import WidgetBox from './WidgetBox';
import { CSS, CANVAS } from './Constant';
import styles from './EditorCanvas.less';
import DndItemTypes, {isResizeHandle} from './DndItemTypes';

const canvasId = 'canvas';

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
    const newWidget = {
      ...item.widget,
    }
    if (delta) {
      const deltaGridX = Math.ceil(delta.x / canvasColumnWidth - 0.5);
      const deltaGridY = Math.ceil(delta.y / CANVAS.rowHeight - 0.5);
      switch(item.type) {
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
      const [ gridLeft, gridTop ] = calcDropOriginPos(offset, canvasColumnWidth);
      const newWidget = {
        ...item,
        gridTop,
        gridLeft,
      }
      return checkBoundary(newWidget);
    } else {
      return null;
    }
  }
}

const handleHoverThrottled = throttle((item, monitor, hoverWidget, setHoverWidget, canvasColumnWidth) => {
  const newWidget = calcNewWidget(item, monitor, canvasColumnWidth);
  if (newWidget === null) {
    // handleHoverThrottled.cancel() might be called after drop()
    // newWidget will be null if it happens
  } else {
    if (hoverWidget &&
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
      console.log('in hover(), new: ', newWidget.gridLeft, newWidget.gridTop, newWidget.className);
      setHoverWidget(newWidget);
    }
  }
}, 16);

function updateCanvasHeight(hoverWidget, widgets, setter) {
  const newHeightOptions = [ CANVAS.minHeight - 2 * CANVAS.rowHeight];
  if (hoverWidget) {
    newHeightOptions.push((hoverWidget.gridTop + hoverWidget.gridHeight) * CANVAS.rowHeight);
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

const NS = 'widgets';
const mapStateToProps = (state) => {
  const widgets = state[NS];
  return {
    widgets,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSetHover: (widgetId) => {
      dispatch({
        type: `${NS}/setHover`,
        widgetId,
      });
    },
    onClearHover: (widgetId) => {
      dispatch({
        type: `${NS}/clearHover`,
        widgetId,
      });
    },
    addOrUpdate: (newWidget) => {
      dispatch({ 
        type: `${NS}/addOrUpdate`,
        widget: newWidget,
      });
    },
  };
};

function EditorCanvas({ widgets, onSetHover, onClearHover, addOrUpdate }) {
  const [ dragging, setDragging ] = useState(false);
  const [ mounted, setMounted ] = useState(false);
  const [ hoverWidget, setHoverWidget ] = useState(null);
  const [ canvasHeight, setCanvasHeight ] = useState(CANVAS.minHeight);
  const [ canvasColumnWidth, setCanvasColumnWidth ] = useState(0);

  const setHover = (widget) => {
    setHoverWidget(widget);
    if (widget && 'id' in widget) {
      onSetHover(widget.id);
    }
  }
  const clearHover = () => {
    handleHoverThrottled.cancel();
    if (hoverWidget && 'id' in hoverWidget) {
      onClearHover(hoverWidget.id);
    }
    setHoverWidget(null);
  }

  const [{isOver}, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop(item, monitor) {
      const newWidget = calcNewWidget(item, monitor, canvasColumnWidth);
      console.log('dropItem:', newWidget);
      addOrUpdate(newWidget);
      return undefined
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

  useLayoutEffect(() => {
    updateCanvasHeight(hoverWidget, widgets, setCanvasHeight);
  }, [hoverWidget, widgets])

  useEffect(() => {
    const updateCanvasColumnWidth = () => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        setCanvasColumnWidth(canvas.offsetWidth / CANVAS.columnCnt);
        console.log(`canvas height: ${canvas.offsetHeight}, width: ${canvas.offsetWidth}`);
      }
    }
    // FIXME(ruitao.xu):
    // Bug: the first cavas offsetWidth is wider than the actual(always more 200px) when the first update
    // solution#1: DONOT work, more 200px still
    //  method: callback ref (ref)[https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node]
    // 
    // solution#2(current): workaround, but I DONOT know why
    //  method: add 500ms delay to the first update
    setTimeout(updateCanvasColumnWidth , 500);
    window.addEventListener('resize', updateCanvasColumnWidth);
    return () => {
      window.removeEventListener('resize', updateCanvasColumnWidth);
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

export default connect(mapStateToProps, mapDispatchToProps)(EditorCanvas);