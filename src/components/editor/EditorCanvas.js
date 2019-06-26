import React, { useState, useEffect, useReducer } from 'react';
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

function WidgetOnCanvas({ gridTop, gridLeft, gridHeight, gridWidth }) {
  const [ exist ] = getCanvasInfoByDOM();
  if (!exist) {
    return null;
  }

  const style = {
    top: gridTop * GRID.heightUnit,
    left: gridLeft * GRID.widthUnit,
    height: gridHeight * GRID.heightUnit,
    width: gridWidth * GRID.widthUnit,
  }
  return (
    <div className={styles.widget} style={style} >
    </div>
  )
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

function calcDropOriginPos(monitor) {
  // both offsets are relative to viewport
  const { x: dropOriginX, y: dropOriginY } = monitor.getClientOffset();
  const [, canvasOriginX, canvasOriginY ] = getCanvasOriginOffsetByDOM();
  const [ x, y ] = [ dropOriginX - canvasOriginX, dropOriginY - canvasOriginY ];

  return [ Math.floor(x / GRID.widthUnit), Math.floor(y / GRID.heightUnit) ];
}

function EditorCanvas({}) {
  const [ dragging, setDragging ] = useState(false);
  const [ mounted, setMounted ] = useState(false);
  const [ widgets, dispatch ] = useReducer(reducer, initialWidgets);

  const [{isOver}, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop: (item, monitor) => {
      const [ gridLeft, gridTop ] = calcDropOriginPos(monitor);
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
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  })

  useEffect(() => {
    setDragging(isOver);
  }, [isOver])

  useEffect(() => {
    setMounted(true);
  })

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
          { dragging && <Grid /> }
          <Button onClick={toggleGrid}>Toggle Grid</Button>
          { mounted && widgets.map(widget => (
            <WidgetOnCanvas key={widget.type+widget.instanceId} {...widget} />
          )) }
        </div>
      </div>
    </div>
  )
}

export default EditorCanvas;