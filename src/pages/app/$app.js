import React, { useEffect } from "react";
import { connect } from "dva";

import styles from "./index.less";

// TODO(ruitao.xu): extract common logic
import * as demoApp from "../editor/demoApp";
import WidgetFactory from "../../components/WidgetFactory";
import { useAutoEvalTemplates } from "../../hooks/app";

const getStyle = (gridTop, gridLeft, gridHeight, gridWidth) => {
  // TODO(ruitao.xu): use CANVAS common and adaptive canvas column width to replace 40/80
  const top = gridTop * 40;
  const left = gridLeft * 80;
  const style = {
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * 40,
    width: gridWidth * 80
  };
  return style;
};

const ViewCanvas = ({ widgets, onWidgetDispatch }) => {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div
          className={styles.canvas}
          style={{ height: "100vh", overflow: "auto" }}
        >
          {Object.keys(widgets).map(widgetId => {
            const widget = widgets[widgetId];
            return (
              <div
                key={widget.id}
                className={styles.widgetBox}
                style={getStyle(
                  widget.gridTop,
                  widget.gridLeft,
                  widget.gridHeight,
                  widget.gridWidth
                )}
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
