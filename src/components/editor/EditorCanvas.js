import React, { useState, useEffect, useReducer, PureComponent } from 'react';
import {
  Button
} from 'antd';
import styles from './EditorCanvas.less';
import { useDrop } from 'react-dnd'
import DndItemTypes from './DndItemTypes';

const canvasId = 'canvas';

const GRID = {
  columnCnt: 13,
  heightUnit: 40,
}

function refreshGRID(canvas) {
  GRID.widthUnit = canvas.offsetWidth/ (GRID.columnCnt - 1);
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

const initialWidgets = [];

const ACTION_TYPE = {
  ADD: 'add',
}

function reducer(widgets, action) {
  switch (action.type) {
    case ACTION_TYPE.ADD:
      let maxInstanceId = 0;
      for (let widget of widgets) {
        if (widget.type === action.item.type) {
          if (widget.instanceId > maxInstanceId) {
            maxInstanceId = widget.instanceId;
          }
        }
      }
      maxInstanceId++;
      const newWidget = {
        ...action.item,
        instanceId: maxInstanceId,
      };
      return [...widgets, newWidget];

    default:
      throw new Error(`unexpected action type: ${action.type}`);
  }
}

class WidgetBox extends PureComponent {
  render() {
    const [ exist ] = getCanvasInfoByDOM();
    if (!exist) {
      return null;
    }

    const { gridTop, gridLeft, gridHeight, gridWidth , bgColor } = this.props
    console.log(gridLeft, gridTop, gridHeight, gridWidth, bgColor);
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
      backgroundColor: bgColor,
    }
    return (
      <div className={styles.widgetBox} style={style} >
      </div>
    )
  }
}

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

function EditorCanvas({}) {
  const [ dragging, setDragging ] = useState(false);
  const [ mounted, setMounted ] = useState(false);
  const [ widgets, dispatch ] = useReducer(reducer, initialWidgets);
  const [ hoverWidget, setHoverWidget ] = useState(null);
  const [ hoverTimer, setHoverTimer ] = useState(null);

  const [{isOver}, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop: (item, monitor) => {
      const [ gridLeft, gridTop ] = calcDropOriginPos(monitor.getClientOffset());
      const newItem = {
        ...item,
        gridTop,
        gridLeft,
      }
      dispatch({ 
        type: ACTION_TYPE.ADD,
        item: newItem,
      })

      return undefined
    },
    // FIXME(ruitao.xu): performance issue
    //  hover is too expensive: too many unneccesary re-render when mouse hover still
    // solution#1: (not tried yet)
    //  CustomizedDragLayer example in react-dnd official site shows that 
    //  no re-render when mouse hover still
    //  SEE IT: https://codesandbox.io/s/react-dnd-example-6-qnhd0
    // solution#2: 
    //  unneccesary re-render comes from WidgetBox mainly,
    //  so re-impl WidgetBox as PureComponent
    //  optimization effect is obvious
    // hover is called very frequently, so use a timer to throttle
    hover: (item, monitor) => {
      if (hoverTimer === null) {
        const timer = setTimeout(() => {
          const [gridLeft, gridTop] = calcDropOriginPos(monitor.getClientOffset());
          if (hoverWidget && gridLeft == hoverWidget.gridLeft && gridTop == hoverWidget.gridTop) {
          } else {
            console.log('in hover: ', gridLeft, gridTop);
            const newItem = {
              ...item,
              gridTop,
              gridLeft,
            }
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

  useEffect(() => {
    setDragging(isOver);
  }, [isOver])

  useEffect(() => {
    setMounted(true);
  }, [])

  useEffect(() => {
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
          { mounted && hoverWidget && <WidgetBox {...hoverWidget} bgColor={'rgba(63, 191, 63, 0.1)'} /> }
          { mounted && widgets.map(widget => (
            <WidgetBox key={widget.type+widget.instanceId} {...widget} bgColor={'blueviolet'} />
          )) }
          <Button onClick={toggleGrid}>Toggle Grid</Button>
        </div>
      </div>
    </div>
  )
}

export default EditorCanvas;