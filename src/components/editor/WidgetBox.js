import React, {  useEffect, useState, } from 'react';
import { useDrag, } from 'react-dnd'
import { getEmptyImage } from "react-dnd-html5-backend";
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { CSS, CANVAS } from './Constant';
import DndItemTypes from './DndItemTypes';
import styles from './EditorCanvas.less';
import WidgetFactory from '../WidgetFactory';

const rhType2StyleMap = {
  [DndItemTypes.RH_LEFT_TOP]: styles.resizeLeftTop,
  [DndItemTypes.RH_RIGHT_TOP]: styles.resizeRightTop,
  [DndItemTypes.RH_RIGHT_BOTTOM]: styles.resizeRightBottom,
  [DndItemTypes.RH_LEFT_BOTTOM]: styles.resizeLeftBottom,
}

const ResizeHandle = React.memo(({type, position, widget, setIsDragging}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {type: type, widget: widget},
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage());
  }, [])

  useEffect(() => {
    setIsDragging(isDragging);
  }, [isDragging])

  return (
    <div ref={drag} className={styles.resizeHandle} style={ position }>
      <div className={rhType2StyleMap[type]}>
        <div className={styles.resizeIcon} />
      </div>
    </div>
  )
});

const WidgetBox = React.memo((props) => {
  const [isResizing, setIsResizing] = useState(false);
  const { gridTop, gridLeft, gridHeight, gridWidth, canvasColumnWidth, id } = props;
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
  // TODO(ruitao.xu): use absolute position instead of calclated position
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
  const cls = classNames({
    [styles.widgetBox]: true,
    [styles.dragging]: isDragging || isResizing,
    [styles.bordered]: !(isDragging || isResizing) && props.showBorder,
  });
  return (
    <div ref={drag} className={cls} style={style} >
      { WidgetFactory.createElement(props.type, {...props.content}) }

      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_LEFT_TOP} 
        position={resizeHandlePositions[DndItemTypes.RH_LEFT_TOP]}
        setIsDragging={setIsResizing}
      />
      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_RIGHT_TOP} 
        position={resizeHandlePositions[DndItemTypes.RH_RIGHT_TOP]} 
        setIsDragging={setIsResizing}
      />
      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_RIGHT_BOTTOM} 
        position={resizeHandlePositions[DndItemTypes.RH_RIGHT_BOTTOM]} 
        setIsDragging={setIsResizing}
      />
      <ResizeHandle 
        widget={ props }
        type={DndItemTypes.RH_LEFT_BOTTOM} 
        position={resizeHandlePositions[DndItemTypes.RH_LEFT_BOTTOM]}
        setIsDragging={setIsResizing}
      />

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

  // canvas-own props
  canvasColumnWidth: PropTypes.number.isRequired,
  showBorder: PropTypes.bool,
};

WidgetBox.defaultProps = {
  showBorder: false,
};

export default WidgetBox;