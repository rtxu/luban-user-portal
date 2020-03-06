import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import classNames from "classnames";
import { Tag, Modal } from "antd";

// @ts-ignore
import styles from "./EditorCanvas.less";

import { CSS, CANVAS } from "./constant";
import DndItemTypes from "./DndItemTypes";
import WidgetFactory from "../WidgetFactory";
import { createLogger } from "../../util";
import { getLayoutStyle } from "../../util/widget";

const logger = createLogger("/components/editor/WidgetBox");

const rhType2StyleMap = {
  [DndItemTypes.RH_LEFT_TOP]: styles.resizeLeftTop,
  [DndItemTypes.RH_RIGHT_TOP]: styles.resizeRightTop,
  [DndItemTypes.RH_RIGHT_BOTTOM]: styles.resizeRightBottom,
  [DndItemTypes.RH_LEFT_BOTTOM]: styles.resizeLeftBottom
};

interface ResizeHandleProps {
  type: string;
  position: any;
  widget: WidgetBoxProps;
  setIsDragging: (toggle: boolean) => void;
}
const ResizeHandle: React.FC<ResizeHandleProps> = React.memo(
  ({ type, position, widget, setIsDragging }) => {
    const [{ isDragging }, drag, preview] = useDrag({
      item: { type: type, widget: widget },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    });

    useEffect(() => {
      preview(getEmptyImage());
    }, []);

    useEffect(() => {
      setIsDragging(isDragging);
    }, [isDragging]);

    return (
      <div ref={drag} className={styles.resizeHandle} style={position}>
        <div className={rhType2StyleMap[type]}>
          <div className={styles.resizeIcon} />
        </div>
      </div>
    );
  }
);

interface WidgetBoxProps {
  type: string; // widget type
  instanceId: number; // widget instance id of the same type
  id: string; // type+instanceId
  gridLeft: number;
  gridTop: number;
  gridWidth: number;
  gridHeight: number;
  content?: object;

  // from EditorCanvas
  canvasColumnWidth: number;
  showBorder?: boolean;
  selected?: boolean;
  onClick: (event: any) => void;
  onDeleteOne: (id: string) => void;
  onWidgetDispatch: (widgetId: string, widgetAction: any) => void;
}
const WidgetBox: React.FC<WidgetBoxProps> = React.memo(props => {
  const [isResizing, setIsResizing] = useState(false);
  const {
    gridTop,
    gridLeft,
    gridHeight,
    gridWidth,
    canvasColumnWidth,
    id
  } = props;
  const [{ isDragging }, drag, preview] = useDrag({
    item: props,
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  useEffect(() => {
    preview(getEmptyImage());
  }, []);

  // console.log('WigetBox', gridLeft, gridTop, gridHeight, gridWidth, id );
  const style = getLayoutStyle({
    gridTop,
    gridLeft,
    gridHeight,
    gridWidth,
    unitHeight: CANVAS.rowHeight,
    unitWidth: canvasColumnWidth
  });
  const {
    resizeHandlePadding,
    widgetBoxHPadding: boxHPadding,
    widgetBoxVPadding: boxVPadding
  } = CSS;
  // BETTER(style) TODO(ruitao.xu): use absolute position instead of calclated position
  const resizeHandlePositions = {
    [DndItemTypes.RH_LEFT_TOP]: {
      transform: `translate(${0 - resizeHandlePadding}px, ${0 -
        resizeHandlePadding}px)`
    },
    [DndItemTypes.RH_RIGHT_TOP]: {
      transform: `translate(${style.width -
        boxHPadding -
        resizeHandlePadding}px, ${0 - resizeHandlePadding}px)`
    },
    [DndItemTypes.RH_RIGHT_BOTTOM]: {
      transform: `translate(${style.width -
        boxHPadding -
        resizeHandlePadding}px, ${style.height -
        boxVPadding -
        resizeHandlePadding}px)`
    },
    [DndItemTypes.RH_LEFT_BOTTOM]: {
      transform: `translate(${0 - resizeHandlePadding}px, ${style.height -
        boxVPadding -
        resizeHandlePadding}px)`
    }
  };
  const cls = classNames({
    [styles.widgetBox]: true,
    [styles.dragging]: isDragging || isResizing,
    [styles.bordered]: !(isDragging || isResizing) && props.showBorder,
    [styles.selected]: props.selected
  });

  function deleteSelectedWidgetIfAny(e) {
    // console.log(`event(${e.type}) occurred on ${e.currentTarget}`);
    if (e.key === "Backspace") {
      Modal.confirm({
        title: `确定要删除 ${props.id} 吗？`,
        okText: "删除",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          props.onDeleteOne(props.id);
        },
        onCancel() {}
      });
    }
  }

  return (
    <div
      ref={drag}
      className={cls}
      style={style}
      onClick={props.onClick}
      // element can not be focused if no tabIndex attr
      // unable to focus => unable to recv keydown event
      tabIndex={0}
      onKeyDown={deleteSelectedWidgetIfAny}
    >
      <Tag>{props.id}</Tag>
      {WidgetFactory.createElement(props.type, {
        ...props.content,
        dispatch: action => {
          logger.debug(`widget(${props.id}) dispatch action(${action})`);
          props.onWidgetDispatch(props.id, action);
        }
      })}

      <ResizeHandle
        widget={props}
        type={DndItemTypes.RH_LEFT_TOP}
        position={resizeHandlePositions[DndItemTypes.RH_LEFT_TOP]}
        setIsDragging={setIsResizing}
      />
      <ResizeHandle
        widget={props}
        type={DndItemTypes.RH_RIGHT_TOP}
        position={resizeHandlePositions[DndItemTypes.RH_RIGHT_TOP]}
        setIsDragging={setIsResizing}
      />
      <ResizeHandle
        widget={props}
        type={DndItemTypes.RH_RIGHT_BOTTOM}
        position={resizeHandlePositions[DndItemTypes.RH_RIGHT_BOTTOM]}
        setIsDragging={setIsResizing}
      />
      <ResizeHandle
        widget={props}
        type={DndItemTypes.RH_LEFT_BOTTOM}
        position={resizeHandlePositions[DndItemTypes.RH_LEFT_BOTTOM]}
        setIsDragging={setIsResizing}
      />
    </div>
  );
});

WidgetBox.defaultProps = {
  showBorder: false
};

export default WidgetBox;
