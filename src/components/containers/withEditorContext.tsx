import React, { useState, useMemo, useCallback } from "react";
import { connect } from "dva";

import {
  addOperation,
  deleteOperation,
  setPreparedSqlTemplateInput,
  execOperation,
  setOperationType,
  setOperationOpListWhenSuccess,
  setOperationOpListWhenFail
} from "../../models/operations";
import {
  addOrUpdateWidget,
  deleteWidget,
  changeWidgetId
} from "../../models/widgets";

interface EditorState {
  activeWidgetId: string | null;
  activeOpId: string | null;
}

interface EditorAction {
  setActiveWidgetId: any;
  setActiveOpId: any;

  addOperation: (id: string) => void;
  deleteOperation: (id: string) => void;
  execOperation: (id: string) => void;
  setOperationInput: (id: string, input: any) => void;
  setOperationType: (id: string, type: any) => void;
  setOpListWhenSuccess: (id: string, list: any) => void;
  setOpListWhenFail: (id: string, list: any) => void;

  // for EditorCanvas
  addOrUpdateWidget: (newWidget: any) => void;
  deleteWidget: (widgetId: string) => void;

  // for WidgetConfigPanel
  changeWidgetId: (oldWidgetId: string, newWidgetId: string) => void;
}

const NotImplementedFn = () => {
  throw new Error("Not Implemented");
};
const defaultContextValue: [EditorState, EditorAction] = [
  {
    activeWidgetId: null,
    activeOpId: null
  },
  {
    setActiveWidgetId: NotImplementedFn,
    setActiveOpId: NotImplementedFn,

    addOperation: NotImplementedFn,
    deleteOperation: NotImplementedFn,
    execOperation: NotImplementedFn,
    setOperationInput: NotImplementedFn,
    setOperationType: NotImplementedFn,
    setOpListWhenSuccess: NotImplementedFn,
    setOpListWhenFail: NotImplementedFn,

    addOrUpdateWidget: NotImplementedFn,
    deleteWidget: NotImplementedFn,

    changeWidgetId: NotImplementedFn
  }
];

/** 必须搭配 AppContext 一起使用 */
export const EditorContext = React.createContext(defaultContextValue);
EditorContext.displayName = "EditorContext";

let EditorProvider = props => {
  const { dispatch, children } = props;
  const [activeWidgetId, setActiveWidgetId] = useState(null);
  const [activeOpId, setActiveOpId] = useState(null);

  // actions
  // for OperationEditor
  const onAddOperation = useCallback(
    (id: string) => {
      dispatch(addOperation({ id }));
    },
    [dispatch]
  );
  const onDeleteOperation = useCallback(
    (id: string) => {
      dispatch(deleteOperation(id));
    },
    [dispatch]
  );
  const onExecOperation = useCallback(
    (id: string) => {
      dispatch(execOperation({ id }));
    },
    [dispatch]
  );
  const onSetOperationInput = useCallback(
    (id: string, input: any) => {
      dispatch(setPreparedSqlTemplateInput({ id, input }));
    },
    [dispatch]
  );
  const onSetOperationType = useCallback(
    (id: string, type: any) => {
      dispatch(setOperationType({ id, type }));
    },
    [dispatch]
  );
  const onSetOpListWhenSuccess = useCallback(
    (id: string, list: any) => {
      dispatch(setOperationOpListWhenSuccess({ id, list }));
    },
    [dispatch]
  );
  const onSetOpListWhenFail = useCallback(
    (id: string, list: any) => {
      dispatch(setOperationOpListWhenFail({ id, list }));
    },
    [dispatch]
  );
  // for EditorCanvas
  const onAddOrUpdateWidget = useCallback(
    (newWidget: any) => {
      dispatch(addOrUpdateWidget(newWidget));
    },
    [dispatch]
  );
  const onDeleteWidget = useCallback(
    (widgetId: string) => {
      dispatch(deleteWidget({ widgetId }));
    },
    [dispatch]
  );
  // for WidgetConfigPanel
  const onChangeWidgetId = useCallback(
    (oldWidgetId: string, newWidgetId: string) => {
      dispatch(changeWidgetId({ oldWidgetId, newWidgetId }));
    },
    [dispatch]
  );

  const ctxValue: [EditorState, EditorAction] = useMemo(
    () => [
      // state
      {
        activeWidgetId,
        activeOpId
      },
      // actions
      {
        setActiveOpId,
        setActiveWidgetId,

        addOperation: onAddOperation,
        deleteOperation: onDeleteOperation,
        execOperation: onExecOperation,
        setOperationInput: onSetOperationInput,
        setOperationType: onSetOperationType,
        setOpListWhenSuccess: onSetOpListWhenSuccess,
        setOpListWhenFail: onSetOpListWhenFail,

        addOrUpdateWidget: onAddOrUpdateWidget,
        deleteWidget: onDeleteWidget,

        changeWidgetId: onChangeWidgetId
      }
    ],
    [activeOpId, activeWidgetId]
  );
  return (
    <EditorContext.Provider value={ctxValue}>{children}</EditorContext.Provider>
  );
};
EditorProvider = connect()(EditorProvider);

export default function withEditorContext(WrappedComponent) {
  return props => (
    <EditorProvider>
      <WrappedComponent {...props} />
    </EditorProvider>
  );
}
