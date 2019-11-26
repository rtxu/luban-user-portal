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

export const EditorContext = React.createContext({
  activeWidgetId: null,
  activeOpId: null,
  setActiveWidgetId(newId) {},
  setActiveOpId(newId) {}
});
EditorContext.displayName = "EditorContext";

let Editor = props => {
  const { dispatch, WrappedComponent, ...restProps } = props;
  const [activeWidgetId, setActiveWidgetId] = useState(null);
  const [activeOpId, setActiveOpId] = useState(null);

  // actions
  // for OperationEditor
  const onAddOperation = useCallback(
    id => {
      dispatch(addOperation({ id }));
    },
    [dispatch]
  );
  const onDeleteOperation = useCallback(
    id => {
      dispatch(deleteOperation(id));
    },
    [dispatch]
  );
  const onExecOperation = useCallback(
    id => {
      dispatch(execOperation(id));
    },
    [dispatch]
  );
  const onSetOperationInput = useCallback(
    (id, input) => {
      dispatch(setPreparedSqlTemplateInput({ id, input }));
    },
    [dispatch]
  );
  const onSetOperationType = useCallback(
    (id, type) => {
      dispatch(setOperationType({ id, type }));
    },
    [dispatch]
  );
  const onSetOpListWhenSuccess = useCallback(
    (id, list) => {
      dispatch(setOperationOpListWhenSuccess({ id, list }));
    },
    [dispatch]
  );
  const onSetOpListWhenFail = useCallback(
    (id, list) => {
      dispatch(setOperationOpListWhenFail({ id, list }));
    },
    [dispatch]
  );
  // for EditorCanvas
  const onAddOrUpdateWidget = useCallback(
    newWidget => {
      dispatch(addOrUpdateWidget(newWidget));
    },
    [dispatch]
  );
  const onDeleteWidget = useCallback(
    widgetId => {
      dispatch(deleteWidget({ widgetId }));
    },
    [dispatch]
  );
  // for WidgetConfigPanel
  const onChangeWidgetId = useCallback(
    (oldWidgetId, newWidgetId) => {
      dispatch(changeWidgetId({ oldWidgetId, newWidgetId }));
    },
    [dispatch]
  );

  const ctxValue = useMemo(
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
    <EditorContext.Provider value={ctxValue}>
      <WrappedComponent {...restProps} />
    </EditorContext.Provider>
  );
};
Editor = connect()(Editor);

export default function withEditorContext(WrappedComponent) {
  return props => <Editor WrappedComponent={WrappedComponent} {...props} />;
}
