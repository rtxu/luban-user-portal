import React, { useCallback, useMemo } from "react";
import { connect } from "dva";

import {
  updateWidgetContent,
  initialState as widgetsInitialState
} from "../../models/widgets";
import {
  initialState as operationsInitialState,
  execOperation
} from "../../models/operations";
import useAppLifecycles from "../../hooks/useAppLifecycles";
import useEvalTemplates from "../../hooks/useEvalTemplates";

export const AppContext = React.createContext({
  widgets: widgetsInitialState,
  operations: operationsInitialState,
  widgetDispatch(widgetId, widgetAction) {}
});

/**
 * 逻辑注入：
 * 1. AppInit/UnInit
 * 2. EvalTempaltes
 *
 * Props 注入：
 * 1. state
 *    1. widgets
 *    2. operations
 * 2. actions
 *    1. widgetDispatch
 *    2. execOperation
 */
const App = props => {
  const {
    dispatch,
    widgets,
    operations,
    appName,
    WrappedComponent,
    ...restProps
  } = props;
  useAppLifecycles(appName, dispatch);
  useEvalTemplates(widgets, operations, dispatch);

  const widgetDispatch = useCallback(
    (widgetId, widgetAction) => {
      dispatch(updateWidgetContent({ widgetId, widgetAction }));
    },
    [dispatch]
  );
  const onExecOperation = useCallback(
    id => {
      dispatch(execOperation(id));
    },
    [dispatch]
  );

  const ctxValue = useMemo(
    () => [
      {
        widgets,
        operations
      },
      {
        widgetDispatch,
        execOperation: onExecOperation
      }
    ],
    [widgets, operations, widgetDispatch]
  );
  return (
    <AppContext.Provider value={ctxValue}>
      <WrappedComponent {...restProps} />
    </AppContext.Provider>
  );
};

const mapStateToProps = state => {
  return {
    widgets: state.widgets,
    operations: state.operations
  };
};
const AppContainer = connect(mapStateToProps)(App);

export default function withAppContext(WrappedComponent) {
  return props => {
    const { match } = props;
    const { app } = match.params;
    return (
      <AppContainer
        appName={app}
        WrappedComponent={WrappedComponent}
        {...props}
      ></AppContainer>
    );
  };
}
