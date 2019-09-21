import PropTypes from 'prop-types';
import styles from './Widget.less';
import { Button as AntButton } from "antd";
import { actionOptions, BUTTON_ACTION_OPTION_MAP } from './common';
import TriggerAnActionConfigPanel from './TriggerAnActionConfigPanel';
// import OpenAnotherLocalPageConfigPanel from './OpenAnotherLocalPageConfigPanel';
import OpenAnyWebPageConfigPanel from './OpenAnyWebPageConfigPanel';

function Button({ text, color, actionType, actionOpenAnyWebPage }) {
  const style = {
    backgroundColor: color,
    borderColor: color,
  }

  // WARNING(ruitao.xu): never use `href` and `target` props
  // If `href` is used, <AntButton> will rendered as <a> instread of <button>,
  // which leads to unnecessary css issues
  const props = {}
  switch (actionType) {
    case BUTTON_ACTION_OPTION_MAP.TriggerAnAction:
      // throw new Error(`not yet implemented action type: ${actionType}`);
      break;
    case BUTTON_ACTION_OPTION_MAP.OpenAnyWebPage:
      props.onClick = () => {
        if (actionOpenAnyWebPage.isOpenInNewTab) {
          window.open(actionOpenAnyWebPage.href);
        } else {
          window.location.href = actionOpenAnyWebPage.href;
        }
      }
      break;

    default:
      throw new Error(`when buildButtonProps: unexpected action type: ${actionType}`);
  }
  
  return (
    <div className={styles.widgetButton} >
      <AntButton type='primary' style={style} {...props} >
        {text}
      </AntButton>
    </div>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  actionType: PropTypes.oneOf(actionOptions),
  actionTriggerAnAction: PropTypes.shape(TriggerAnActionConfigPanel.propTypes),
  actionOpenAnyWebPage: PropTypes.shape(OpenAnyWebPageConfigPanel.propTypes),

  dispatch: PropTypes.func.isRequired,
}

export default Button;
