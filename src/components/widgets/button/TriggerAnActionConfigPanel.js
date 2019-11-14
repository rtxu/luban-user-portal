import { connect } from "dva";
import PropTypes from "prop-types";

import Config from "../Config";
import { TriggerAnAction } from "./reducer";

import { addOperation } from "../../../pages/editor/models/operations";
import { setActiveOpId } from "../../../pages/editor/models/editorCtx";

function TriggerAnActionConfigPanel({
  opId,
  opNames,
  activeWidgetId,
  onAddOperation,
  dispatch
}) {
  const newOp = "新建<操作>";
  const options = [newOp, ...opNames];

  function onChange(value) {
    if (value === newOp) {
      const newOpId = `${activeWidgetId}Trigger`;
      onAddOperation(newOpId);
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
  opNames: PropTypes.array,
  activeWidgetId: PropTypes.string,

  onAddOperation: PropTypes.func,

  // ownProps
  opId: PropTypes.string,
  dispatch: PropTypes.func
};

const mapStateToProps = state => {
  return {
    opNames: Object.keys(state.operations),
    activeWidgetId: state.editorCtx.activeWidgetId
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onAddOperation: newOpId => {
      dispatch(addOperation({ id: newOpId }));
      dispatch(setActiveOpId(newOpId));
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TriggerAnActionConfigPanel);
