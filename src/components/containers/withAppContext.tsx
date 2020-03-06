import React, { useCallback, useEffect, useMemo } from "react";
import { connect } from "dva";

import {
  updateWidgetContent,
  IWidgetMap,
  initWidgets,
  initialState as widgetsInitialState
} from "@/models/widgets";
import {
  execOperation,
  IOperationMap,
  initOperations,
  initialState as operationsInitialState
} from "@/models/operations";
import {
  AppMeta,
  AppState,
  EmptyAppAction,
  EmptyAppMeta,
  AppAction
} from "@/types/app";
import useEvalTemplates from "@/hooks/useEvalTemplates";

interface AppContextValue {
  meta: AppMeta;
  state: AppState;
  action: AppAction;
}

const defaultContextValue: AppContextValue = {
  meta: EmptyAppMeta,
  state: {
    widgets: widgetsInitialState,
    operations: operationsInitialState
  },
  action: EmptyAppAction
};
export const AppContext = React.createContext(defaultContextValue);
AppContext.displayName = "AppContext";

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
interface AppContextProviderProps {
  // from redux
  dispatch: any;
  widgets: IWidgetMap;
  operations: IOperationMap;

  initialData: AppState;
  appMeta: AppMeta;
  children: any;
}
const AppContextProvider: React.FC<AppContextProviderProps> = props => {
  const {
    dispatch,
    widgets,
    operations,
    appMeta,
    initialData,
    children
  } = props;

  useEffect(() => {
    dispatch(initWidgets(initialData.widgets));
    dispatch(initOperations(initialData.operations));
    return () => {
      dispatch(initWidgets(widgetsInitialState));
      dispatch(initOperations(operationsInitialState));
    };
  }, [initialData, dispatch, widgetsInitialState, operationsInitialState]);

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

  const ctxValue: AppContextValue = useMemo(
    () => ({
      meta: appMeta,
      state: { widgets, operations },
      action: {
        widgetDispatch,
        execOperation: onExecOperation
      }
    }),
    [appMeta, widgets, operations, widgetDispatch, onExecOperation]
  );
  return <AppContext.Provider value={ctxValue}>{children}</AppContext.Provider>;
};

const mapStateToProps = state => {
  return {
    widgets: state.widgets,
    operations: state.operations
  };
};
interface AppContextProviderReduxProps {
  appMeta: AppMeta;
  initialData: AppState;
  children: any;
}
export const AppContextProviderRedux: React.FC<AppContextProviderReduxProps> = connect(
  mapStateToProps
)(AppContextProvider);
