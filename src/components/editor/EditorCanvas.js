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

function getCanvasInfo() {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return [false];
  }

  const widthUnit = canvas.offsetWidth/ (GRID.columnCnt - 1);
  return [true, canvas.offsetHeight, canvas.offsetWidth, GRID.heightUnit, widthUnit]
}

function Grid({}) {
  const [exist, canvasHeight, , heightUnit, offsetUnit] = getCanvasInfo();
  if (!exist) {
    return null;
  }

  const height = canvasHeight + 2 * heightUnit;
  const dotWidth = 2;
  const offsetToCenter = dotWidth / 2;
  let leftOffset = -offsetToCenter;
  let columns = [];
  for (let i = 0; i < GRID.columnCnt; i++) {
    const style = {
      height: height,
      transform: `translate3d(${leftOffset}px, 0px, 0px)`,
    }
    leftOffset += offsetUnit;
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
      for (const widget in widgets) {
        if (widget.type === action.item.type) {
          if (widget.instanceId > maxInstanceId) {
            maxInstanceId = widget.instanceId;
          }
        }
      }
      maxInstanceId++;
      return widgets.concat([{
        ...action.item,
        instanceId: maxInstanceId,
      }]);

    default:
      throw new Error(`unexpected action type: ${action.type}`);
  }
}

function WidgetOnCanvas({ gridTop, gridLeft, gridHeight, gridWidth }) {
  const [exist, , , heightUnit, widthUnit] = getCanvasInfo();
  if (!exist) {
    return null;
  }

  const style = {
    top: gridTop * heightUnit,
    left: gridLeft * widthUnit,
    height: gridHeight * heightUnit,
    width: gridWidth * widthUnit,
  }
  return (
    <div className={styles.widget} style={style} >
    </div>
  )
}

function EditorCanvas({}) {
  const [ dragging, setDragging ] = useState(false);
  const [ mounted, setMounted ] = useState(false);
  const [ widgets, dispatch ] = useReducer(reducer, initialWidgets);

  const [{isOver}, drop] = useDrop({
    accept: Object.values(DndItemTypes),
    drop: (item, monitor) => {
      // TODO(ruitao.xu): position when drop
      const [ gridTop, gridLeft ] = [1, 0]

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