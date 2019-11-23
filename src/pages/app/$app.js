import React, { useContext } from "react";
import { useMeasure } from "react-use";

import styles from "./index.less";
import { CANVAS } from "../../components/editor/constant";

import WidgetFactory from "../../components/WidgetFactory";
import { getLayoutStyle } from "../../util/widget";
import withAppContext, {
  AppContext
} from "../../components/containers/withAppContext";

const ViewCanvas = () => {
  const [{ widgets }, { widgetDispatch }] = useContext(AppContext);
  const [canvasRef, { width: canvasWidth }] = useMeasure();
  const canvasColumnWidth = canvasWidth / CANVAS.columnCnt;
  const canvasHeight = Object.keys(widgets).reduce((currentMax, widgetId) => {
    const w = widgets[widgetId];
    return Math.max(
      (w.gridTop + w.gridHeight + 2) * CANVAS.rowHeight,
      currentMax
    );
  }, CANVAS.minHeight);

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      style={{ height: canvasHeight }}
    >
      {Object.keys(widgets).map(widgetId => {
        const widget = widgets[widgetId];
        return (
          <div
            key={widget.id}
            className={styles.widgetBox}
            style={getLayoutStyle({
              ...widget,
              unitHeight: CANVAS.rowHeight,
              unitWidth: canvasColumnWidth
            })}
          >
            {WidgetFactory.createElement(widget.type, {
              ...widget.content,
              dispatch: action => {
                widgetDispatch(widget.id, action);
              }
            })}
          </div>
        );
      })}
    </div>
  );
};

export default withAppContext(ViewCanvas);
