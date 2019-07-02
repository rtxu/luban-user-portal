import React, { useState, useEffect, useLayoutEffect, useReducer } from 'react';
import {
  Button
} from 'antd';
import styles from './EditorCanvas.less';
import { useDrag, useDrop } from 'react-dnd'
import DndItemTypes from './DndItemTypes';
import PropTypes from 'prop-types';
import { getEmptyImage } from "react-dnd-html5-backend";

const canvasId = 'canvas';

// TODO(ruitao.xu): 
// 1. extract canvas height/width as props
// 2. subscribe window.resize event
const GRID = {
  columnCnt: 13,
  heightUnit: 40,
}

function refreshGRID(canvas) {
  GRID.widthUnit = canvas.offsetWidth / (GRID.columnCnt - 1);
}

function getCanvasInfoByDOM() {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return [false];
  }
  refreshGRID(canvas);

  return [true, canvas.offsetHeight, canvas.offsetWidth]
}

function Grid({}) {
  const [exist, canvasHeight ] = getCanvasInfoByDOM();
  if (!exist) {
    return null;
  }

  const height = canvasHeight + 2 * GRID.heightUnit;
  const dotWidth = 2;
  const offsetToCenter = dotWidth / 2;
  let leftOffset = -offsetToCenter;
  let columns = [];
  for (let i = 0; i < GRID.columnCnt; i++) {
    const style = {
      height: height,
      transform: `translate3d(${leftOffset}px, 0px, 0px)`,
    }
    leftOffset += GRID.widthUnit;
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
  const [ exist ] = getCanvasInfoByDOM();
  if (!exist) {
    return null;
  }

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
  const top = gridTop * GRID.heightUnit;
  const left = gridLeft * GRID.widthUnit;
  const style = {
    /*
    // try to optimize performance, use transform instead of top/left, no obvious effect
    top: gridTop * GRID.heightUnit,
    left: gridLeft * GRID.widthUnit,
    */
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * GRID.heightUnit,
    width: gridWidth * GRID.widthUnit,
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
  refreshGRID(canvas);

  const rect = canvas.getBoundingClientRect();
  return [ true, rect.x, rect.y ]
}

function calcDropOriginPos({ x: dropOriginX, y: dropOriginY }) {
  // both offsets are relative to viewport
  const [, canvasOriginX, canvasOriginY ] = getCanvasOriginOffsetByDOM();
  const [ x, y ] = [ dropOriginX - canvasOriginX, dropOriginY - canvasOriginY ];

  return [ Math.floor(x / GRID.widthUnit), Math.floor(y / GRID.heightUnit) ];
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

function EditorCanvas({}) {
  const [ dragging, setDragging ] = useState(false);
  const [ mounted, setMounted ] = useState(false);
  const [ widgets, dispatch ] = useWidgetsReducer();
  const [ hoverWidget, setHoverWidget ] = useState(null);
  const [ hoverTimer, setHoverTimer ] = useState(null);

  function calcNewWidget(item, monitor) {
    const [ gridLeft, gridTop ] = calcDropOriginPos(monitor.getClientOffset());
    return {
      ...item,
      gridTop,
      gridLeft,
    }
  }

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
    // hover is called very frequently, so use a timer to throttle
    hover(item, monitor) {
      if (hoverTimer === null) {
        const timer = setTimeout(() => {
          const newItem = calcNewWidget(item, monitor);
          if (hoverWidget && 
            hoverWidget.gridLeft === newItem.gridLeft && 
            hoverWidget.gridTop === newItem.gridTop
            ) {
          } else {
            /*
            if (hoverWidget) {
              console.log('in hover(), original: ', hoverWidget.gridLeft, hoverWidget.gridTop, hoverWidget.className);
            } else {
              console.log('hoverWidget: ', hoverWidget)
            }
            */
            if (monitor.canDrop()) {
              newItem.className = styles.hoverWidgetBox;
            } else {
              newItem.className = styles.hoverWidgetBoxCanNotPlace;
            }
            newItem.isHover = true;
            console.log('in hover(), new: ', newItem.gridLeft, newItem.gridTop, newItem.className);
            setHoverWidget(newItem);
          }
          setHoverTimer(null);
        }, 10);
        setHoverTimer(timer);
      }
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
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        setHoverTimer(null);
      }
    }
  }, [isOver, hoverTimer])

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
        <div id={canvasId} ref={drop} className={canvasClassName}>
          { mounted && dragging && <Grid /> }
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