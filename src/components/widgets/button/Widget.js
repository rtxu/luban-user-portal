import PropTypes from "prop-types";
import styles from "./Widget.less";
import { connect } from "dva";
import { Button as AntButton, notification } from "antd";
import { actionOptions, BUTTON_ACTION_OPTION_MAP } from "./common";
import TriggerAnActionConfigPanel from "./TriggerAnActionConfigPanel";
// import OpenAnotherLocalPageConfigPanel from './OpenAnotherLocalPageConfigPanel';
import OpenAnyWebPageConfigPanel from "./OpenAnyWebPageConfigPanel";

import { execOperation } from "../../../pages/editor/models/operations";

function Button({
  text,
  color,
  actionType,
  actionOpenAnyWebPage,
  actionTriggerAnAction,
  onExecOperation
}) {
  const style = {
    backgroundColor: color,
    borderColor: color
  };

  const onClick = () => {
    // console.log('====', actionType, actionTriggerAnAction, actionOpenAnyWebPage);
    switch (actionType) {
      case BUTTON_ACTION_OPTION_MAP.TriggerAnAction:
        if (actionTriggerAnAction.opId) {
          // console.log('onExecOperation', actionTriggerAnAction.opId);
          onExecOperation(actionTriggerAnAction.opId);
        }
        /*
        else {
          notification.error({
            message: '<操作>为空，请选择要执行的<操作>',
          });
        }
        */
        break;
      case BUTTON_ACTION_OPTION_MAP.OpenAnyWebPage:
        // WARNING(ruitao.xu): never use `href` and `target` props of <AntButton>
        // If `href` is used, <AntButton> will rendered as <a> instread of <button>,
        // which leads to unnecessary css issues
        if (actionOpenAnyWebPage.isOpenInNewTab) {
          window.open(actionOpenAnyWebPage.href);
        } else {
          window.location.href = actionOpenAnyWebPage.href;
        }
        break;

      default:
        throw new Error(
          `when buildButtonActions: unexpected action type: ${actionType}`
        );
    }
  };

  return (
    <div className={styles.widgetButton}>
      <AntButton type="primary" style={style} onClick={onClick}>
        {text}
      </AntButton>
    </div>
  );
}

Button.propTypes = {
  onExecOperation: PropTypes.func,

  // ownProps
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  actionType: PropTypes.oneOf(actionOptions),
  actionTriggerAnAction: PropTypes.shape(TriggerAnActionConfigPanel.propTypes),
  actionOpenAnyWebPage: PropTypes.shape(OpenAnyWebPageConfigPanel.propTypes),

  dispatch: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    onExecOperation: opId => {
      dispatch(execOperation({ id: opId }));
    }
  };
};
export default connect(null, mapDispatchToProps)(Button);
