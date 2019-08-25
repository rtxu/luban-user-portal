import React, {  useEffect, useState, } from 'react';
import { useDrag, } from 'react-dnd'
import { getEmptyImage } from "react-dnd-html5-backend";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'dva';
import { Tag, Modal } from 'antd'

import { CSS, CANVAS } from './Constant';
import DndItemTypes from './DndItemTypes';
import styles from './EditorCanvas.less';
import WidgetFactory from '../WidgetFactory';
import { NS, withAfterSave } from '@/pages/editor/models/widgets';
import { wrapDispatchToFire } from '@/util'
import { createLogger } from '../../util';

const logger = createLogger('/components/editor/WidgetBox');

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

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => {
  return wrapDispatchToFire(dispatch, (fire) => {
    return {
      widgetDispatch: (widgetId, widgetAction) => {
        fire(`${NS}/updateContent`, {
          widgetId,
          widgetAction,
        }, withAfterSave)
      },
    };
  })
};

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
  // BETTER(style) TODO(ruitao.xu): use absolute position instead of calclated position
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
    [styles.selected]: props.selected,
  });

  function deleteSelectedWidgetIfAny(e) {
    if (e.key === 'Backspace') {
      Modal.confirm({
        title: `确定要删除 ${props.id} 吗？`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          props.deleteOne(props.id);
        },
        onCancel() { },
      });
    }
  }

  return (
    <div ref={drag} className={cls} style={style} onClick={props.onClick}
      // element can not be focused if no tabIndex attr
      // unable to focus => unable to recv keydown event
      tabIndex='0'
      onKeyDown={deleteSelectedWidgetIfAny}
    >
      <Tag>{props.id}</Tag>
      { 
        WidgetFactory.createElement(props.type, 
        {
          ...props.content, 
          dispatch: (action) => {
            logger.debug(`widget(${props.id}) dispatch action(${action})`);
            props.widgetDispatch(props.id, action)
          }
        }) 
      }

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

  // from canvas
  canvasColumnWidth: PropTypes.number.isRequired,
  showBorder: PropTypes.bool,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  deleteOne: PropTypes.func,

  // from connect
  widgetDispatch: PropTypes.func.isRequired,
};

WidgetBox.defaultProps = {
  showBorder: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetBox);