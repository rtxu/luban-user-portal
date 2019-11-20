import React, { useEffect } from "react";
import { connect } from "dva";
import { useMeasure } from "react-use";

import styles from "./index.less";
import { updateWidgetContent } from "../../models/widgets";
import { CANVAS } from "../../components/editor/constant";

// TODO(ruitao.xu): extract common logic
import * as demoApp from "../editor/demoApp";
import WidgetFactory from "../../components/WidgetFactory";
import { useAutoEvalTemplates } from "../../hooks/app";
import { getLayoutStyle } from "../../util/widget";

const ViewCanvas = ({ widgets, onWidgetDispatch }) => {
  const [canvasRef, { width }] = useMeasure();
  const canvasColumnWidth = width / CANVAS.columnCnt;

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div ref={canvasRef} className={styles.canvas}>
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
                    onWidgetDispatch(widget.id, action);
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const App = ({ match, dispatch, widgets, onWidgetDispatch, operations }) => {
  useEffect(() => {
    const { app } = match.params;
    console.log(`app initializing: ${app}`);
    if (app === "demo") {
      demoApp.setUp(dispatch);
    }

    return function cleanup() {
      console.log(`app un-initializing: ${app}`);
      if (app === "demo") {
        demoApp.cleanUp(dispatch);
      }
    };
  }, []);

  useAutoEvalTemplates(widgets, operations, dispatch);

  return <ViewCanvas widgets={widgets} onWidgetDispatch={onWidgetDispatch} />;
};

const mapStateToProps = state => {
  return {
    widgets: state.widgets,
    operations: state.operations
  };
};
const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    onWidgetDispatch: (widgetId, widgetAction) => {
      dispatch(updateWidgetContent({ widgetId, widgetAction }));
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);
