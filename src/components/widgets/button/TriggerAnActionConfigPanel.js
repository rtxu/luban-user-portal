import { useContext } from "react";
import PropTypes from "prop-types";

import Config from "../Config";
import { TriggerAnAction } from "./reducer";

import { AppContext } from "../../containers/AppContextProvider";
import { EditorContext } from "../../containers/withEditorContext";

function TriggerAnActionConfigPanel({ opId, dispatch }) {
  const [{ operations }] = useContext(AppContext);
  const opNames = Object.keys(operations);
  const [{ activeWidgetId }, { setActiveOpId, addOperation }] = useContext(
    EditorContext
  );
  const newOp = "新建<操作>";
  const options = [newOp, ...opNames];

  function onChange(value) {
    if (value === newOp) {
      const newOpId = `${activeWidgetId}Trigger`;
      addOperation(newOpId);
      setActiveOpId(newOpId);
      dispatch(TriggerAnAction.setOp(newOpId));
    } else {
      dispatch(TriggerAnAction.setOp(value));
    }
  }

  return (
    <Config.LabelSelect
      select={{
        placeholder: "选择<操作>",
        options: options,
        onChange: onChange,
        value: opId
      }}
    />
  );
}

TriggerAnActionConfigPanel.propTypes = {
  // ownProps
  opId: PropTypes.string,
  dispatch: PropTypes.func
};

export default TriggerAnActionConfigPanel;
